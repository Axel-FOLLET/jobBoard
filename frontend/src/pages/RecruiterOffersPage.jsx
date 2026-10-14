// Onglet « Mes postes » : les annonces de l'entreprise en deux tableaux, ouvertes puis clôturées.
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../api.js'

// Statuts de l'API (ads.status) traduits pour l'écran.
const STATUS_LABELS = { open: 'Ouvert', closed: 'Fermé' }

// Tableau d'annonces : poste (lien vers ses candidatures), nombre de candidatures, statut.
// applications_count et status viennent de GET /api/recruiter/ads.
function PostesTable({ postes, closed = false }) {
  return (
    <div className="table-scroll">
      <table className={`postes-table${closed ? ' postes-table-closed' : ''}`}>
        <thead>
          <tr>
            <th>Poste</th>
            <th>Candidatures</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {postes.map((poste) => (
            <tr key={poste.id}>
              <td><Link to={`/recruteur/postes/${poste.id}/candidatures`}>{poste.title}</Link></td>
              <td>{poste.applications_count}</td>
              <td>{STATUS_LABELS[poste.status] ?? poste.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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

  // Une annonce clôturée quitte le premier tableau pour « Mes postes clôturés ».
  const ouverts = postes.filter((poste) => poste.status !== 'closed')
  const clotures = postes.filter((poste) => poste.status === 'closed')

  return (
    <>
      <h1>Mes postes</h1>

      {/* En cas d'erreur, « pas encore publié » serait faux : on affiche l'erreur à la place. */}
      {loadError ? (
        <p>Impossible de charger vos postes pour le moment.</p>
      ) : postes.length === 0 ? (
        <p>Vous n'avez pas encore publié de poste.</p>
      ) : ouverts.length === 0 ? (
        <p>Aucun poste ouvert pour le moment.</p>
      ) : (
        <PostesTable postes={ouverts} />
      )}

      <p><Link to="/recruteur/nouvelle-offre">Publier une nouvelle offre</Link></p>

      {/* Second tableau, grisé, seulement s'il y a des annonces fermées. */}
      {clotures.length > 0 && (
        <>
          <h2>Mes postes clôturés</h2>
          <PostesTable postes={clotures} closed />
        </>
      )}
    </>
  )
}
