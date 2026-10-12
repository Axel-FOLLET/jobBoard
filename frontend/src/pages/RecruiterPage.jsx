// Accueil du recruteur : les trois postes les plus répondus, puis les trois postes
// dont un candidat attend une réponse depuis plus de deux semaines.
import { Link } from 'react-router'
import { postesLesPlusRepondus, postesSansReponse } from '../recruiterSelection.js'

export default function RecruiterPage() {
  // En attente de la route de l'API qui renvoie les postes de l'entreprise connectée
  // avec applications_count et oldest_unanswered_at : la liste reste vide pour l'instant.
  const postes = []
  const plusRepondus = postesLesPlusRepondus(postes)
  const sansReponse = postesSansReponse(postes)

  return (
    <>
      <h1>Espace recruteur</h1>

      <section>
        <h2>Postes qui reçoivent le plus de réponses</h2>
        {plusRepondus.length === 0 ? (
          <p>Aucune candidature pour le moment.</p>
        ) : (
          <ul>
            {plusRepondus.map((poste) => (
              <li key={poste.id}>
                {poste.title} — {poste.applications_count} candidature{poste.applications_count > 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Candidats sans réponse depuis plus de deux semaines</h2>
        {sansReponse.length === 0 ? (
          <p>Aucun candidat n'attend de réponse depuis plus de deux semaines.</p>
        ) : (
          <ul>
            {sansReponse.map((poste) => (
              <li key={poste.id}>
                {poste.title} — en attente depuis le {poste.oldest_unanswered_at.slice(0, 10)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p><Link to="/recruteur/postes">Voir tous mes postes</Link></p>
    </>
  )
}
