import { useState } from 'react'

export default function JobOffer({ id, company, title, shortDescription, location }) {
  const [showDetails, setShowDetails] = useState(false) // détail fermé au départ
  const [details, setDetails] = useState(null) // null = rien reçu encore
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const willOpen = !showDetails
    setShowDetails(willOpen) // ouvert ↔ fermé tout de suite, sans attendre le serveur
    // Fetch seulement en ouvrant, si pas encore reçu et pas déjà en cours
    if (willOpen && details === null && !loading) {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/ads/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch job offer details')
        }
        const data = await response.json()
        setDetails(data)
      } catch (err) {
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
      <button onClick={handleClick}>{showDetails ? 'Voir moins' : 'En savoir plus'}</button>
      <button>Postuler</button>
      {showDetails && loading && <p>Chargement des informations complémentaires…</p>}
      {showDetails && error && <p>{error}</p>}
      {/* Ouvert ET reçu, sinon details.xxx planterait sur null */}
      {showDetails && details && (
        <div>
          <p>{details.description}</p>
          <p>Salaire :{details.salary}</p>
          <p>{details.working_time}</p>
          <p>{details.contract_type}</p>
          <p>{details.category}</p>
          <p>Publiée le {details.created_at.slice(0, 10)}</p>
        </div>
      )}
    </div>
  )
}
