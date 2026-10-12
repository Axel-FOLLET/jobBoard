// Carte d'une annonce : résumé toujours visible, détail et candidature à la demande.
import { useState } from 'react'
import Form from './Form'
import { apiFetch } from '../api.js'

export default function JobOffer({ id, company, title, shortDescription, location }) {
  // Détail et formulaire fermés au départ.
  const [showDetails, setShowDetails] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // details à null = le détail n'a pas encore été demandé à l'API.
  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const willOpen = !showDetails
    // Ouvert ↔ fermé tout de suite, sans attendre le serveur.
    setShowDetails(willOpen)
    // Appel réseau seulement à l'ouverture, si le détail n'est ni déjà reçu ni en cours.
    if (willOpen && details === null && !loading) {
      setLoading(true)
      setError(null)
      try {
        const { ok, data, error: apiError } = await apiFetch(`/api/ads/${id}`)
        if (!ok) {
          throw new Error(apiError)
        }
        setDetails(data)
      } catch (err) {
        // Détail technique dans la console, message lisible pour le visiteur.
        console.error(err)
        setError("Nous n'arrivons pas à charger les détails pour le moment. Merci de réessayer dans quelques instants.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="job-offer">
      <h2>{company}</h2>
      <p>{title}</p>
      <p>{shortDescription}</p>
      <p>{location}</p>
      {/* Deux boutons indépendants : le détail et la candidature s'ouvrent séparément. */}
      <div className="offer-actions">
        <button className="button-secondary" onClick={handleClick}>{showDetails ? 'Voir moins' : 'En savoir plus'}</button>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : 'Postuler'}</button>
      </div>
      {showForm && <Form id={id} onClose={() => setShowForm(false)} />}
      {showDetails && loading && <p>Chargement des informations complémentaires…</p>}
      {showDetails && error && <p>{error}</p>}
      {/* Ouvert ET reçu : sinon details.description planterait sur null. */}
      {showDetails && details && (
        <div>
          <p className="description">{details.description}</p>
          <p>{details.salary ? `Salaire : ${details.salary.toLocaleString('fr-FR')}€ brut par an` : 'Salaire non communiqué'}</p>
          <p>{details.working_time}</p>
          <p>{details.contract_type}</p>
          <p>{details.category}</p>
          {/* created_at est une date suivie d'une heure : les dix premiers caractères suffisent. */}
          <p>Publiée le {details.created_at.slice(0, 10)}</p>
        </div>
      )}
    </div>
  )
}
