// Onglet « Mes postes » : la liste des annonces de l'entreprise et leur état.
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../api.js'

export default function RecruiterOffersPage() {
  // Toutes les annonces de l'entreprise, ouvertes et fermées.
  const [postes, setPostes] = useState([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    async function fetchPostes() {
      const { ok, status, data, error } = await apiFetch('/api/recruiter/ads')
      if (ok) {
        setPostes(data)
      } else {
        setLoadError(true)
        console.error('Error fetching recruiter ads:', status, error)
      }
    }
    fetchPostes()
  }, [])

  return (
    <>
      <h1>Mes postes</h1>

      {/* En cas d'erreur, « pas encore publié » serait faux : on affiche l'erreur à la place. */}
      {loadError ? (
        <p>Impossible de charger vos postes pour le moment.</p>
      ) : postes.length === 0 ? (
        <p>Vous n'avez pas encore publié de poste.</p>
      ) : (
        <ul>
          {postes.map((poste) => (
            <li key={poste.id}>{poste.title}{poste.status === 'closed' && ' — annonce fermée'}</li>
          ))}
        </ul>
      )}

      <p><Link to="/recruteur/nouvelle-offre">Publier une nouvelle offre</Link></p>
    </>
  )
}
