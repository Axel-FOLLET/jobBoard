// Candidatures reçues pour une annonce du recruteur (GET /api/recruiter/ads/<id>/applications),
// et clôture de l'annonce en choisissant le candidat retenu (POST /api/recruiter/ads/<id>/closure).
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { apiFetch } from '../api.js'

// "2026-10-08 18:15:02" (UTC, comme le renvoie SQLite) -> "8 octobre 2026"
function formatDate(value) {
  return new Date(value.replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Statuts de l'API traduits pour l'écran.
const STATUS_LABELS = { pending: 'En attente', accepted: 'Retenue', rejected: 'Non retenue' }

// Refus de la clôture traduits pour l'écran (messages du contrat).
const CLOSURE_ERRORS = {
  'Missing field: accepted_application_id': 'Choisissez le candidat retenu.',
  'Ad already closed': 'Cette annonce est déjà clôturée.',
  'Application does not belong to this ad': 'Cette candidature ne correspond pas à l\'annonce. Rechargez la page.',
}

const CLOSURE_CONFIRM = 'Clôturer l\'annonce ? Chaque candidat recevra un e-mail, et l\'annonce ne pourra plus être modifiée.'

export default function RecruiterApplicationsPage() {
  // id de l'annonce, lu dans l'URL /recruteur/postes/:id/candidatures.
  const { id } = useParams()
  const [applications, setApplications] = useState([])
  // null tant que rien n'a échoué, sinon 'not-found' (404 Ad not found) ou 'other'.
  const [loadError, setLoadError] = useState(null)
  // Statut de l'annonce ('open' ou 'closed'), lu avec GET /api/ads/<id> ; null tant qu'il est inconnu.
  const [adStatus, setAdStatus] = useState(null)
  // id de la candidature choisie avec le bouton radio, null tant qu'aucun candidat n'est choisi.
  const [selectedId, setSelectedId] = useState(null)
  const [closing, setClosing] = useState(false)
  const [closeError, setCloseError] = useState('')
  // Augmenté après une clôture réussie : relance le chargement de la liste et du statut.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    async function fetchApplications() {
      const { ok, status, data, error } = await apiFetch('/api/recruiter/ads/' + id + '/applications')
      if (ok) {
        setApplications(data)
        setLoadError(null)
      } else {
        // Seul le 404 du contrat désigne une annonce inconnue ou d'une autre entreprise.
        setLoadError(status === 404 && error === 'Ad not found' ? 'not-found' : 'other')
        console.error('Error fetching recruiter applications:', status, error)
      }

      // GET /api/ads/<id> renvoie status, y compris pour une annonce fermée.
      const ad = await apiFetch('/api/ads/' + id)
      setAdStatus(ad.ok ? ad.data.status : null)
    }
    fetchApplications()
  }, [id, reloadKey])

  async function handleClose(event) {
    event.preventDefault()
    setCloseError('')

    if (!window.confirm(CLOSURE_CONFIRM)) return

    // Sans candidature, l'API attend un corps vide ; sinon, la candidature retenue.
    const body = applications.length === 0 ? {} : { accepted_application_id: selectedId }

    setClosing(true)
    const { ok, status, error } = await apiFetch('/api/recruiter/ads/' + id + '/closure', { method: 'POST', body })
    setClosing(false)

    if (ok) {
      // Recharger : les statuts passent à « Retenue » et « Non retenue », le bouton disparaît.
      setSelectedId(null)
      setReloadKey((key) => key + 1)
      return
    }

    setCloseError(CLOSURE_ERRORS[error] ?? 'Impossible de clôturer l\'annonce pour le moment.')
    console.error('Closure refused:', status, error)
  }

  // La clôture n'est proposée que pour une annonce de l'entreprise, chargée sans erreur, encore ouverte.
  const canClose = loadError === null && adStatus === 'open'

  return (
    <section>
      {/* Flèche de retour vers « Mes postes », toujours visible, même quand l'annonce est introuvable. */}
      <p className="back-link"><Link to="/recruteur/postes">← Mes postes</Link></p>
      <h1>Candidatures reçues</h1>

      {loadError === 'not-found' ? (
        <p>Cette annonce n'existe pas ou n'appartient pas à votre entreprise.</p>
      ) : loadError === 'other' ? (
        <p>Impossible de charger les candidatures pour le moment.</p>
      ) : applications.length === 0 ? (
        <p>Aucune candidature pour cette annonce pour le moment.</p>
      ) : (
        // Ordre de l'API conservé : de la plus ancienne à la plus récente.
        <ul>
          {applications.map((application) => (
            <li key={application.id}>
              <h3>{application.first_name} {application.last_name}</h3>
              <p>E-mail : <a href={`mailto:${application.email}`}>{application.email}</a></p>
              {application.phone && <p>Téléphone : {application.phone}</p>}
              <p>Message : {application.message}</p>
              <p>Envoyée le {formatDate(application.created_at)}</p>
              <p className={`application-status status-${application.status}`}>
                Statut : {STATUS_LABELS[application.status] ?? application.status}
              </p>
              {/* Un bouton radio par candidature, seulement tant que l'annonce est ouverte. */}
              {canClose && (
                <label>
                  <input
                    type="radio"
                    name="accepted-application"
                    value={application.id}
                    checked={selectedId === application.id}
                    onChange={() => setSelectedId(application.id)}
                    form="closure-form"
                  />
                  {' '}Retenir ce candidat
                </label>
              )}
            </li>
          ))}
        </ul>
      )}

      {canClose && (
        <form id="closure-form" onSubmit={handleClose}>
          {/* Désactivé tant qu'aucun candidat n'est choisi (sauf annonce sans candidature) ou pendant l'envoi.
              Rouge (button-danger, comme « Supprimer » en administration) : action définitive. */}
          <button className="button-danger" type="submit" disabled={closing || (applications.length > 0 && selectedId === null)}>
            Clôturer l'annonce
          </button>
          {closeError && <p role="alert">{closeError}</p>}
        </form>
      )}
    </section>
  )
}
