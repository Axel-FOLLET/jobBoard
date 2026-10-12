// Onglet « Mes postes » : la liste des annonces de l'entreprise et leur état.
import { Link } from 'react-router'

export default function RecruiterOffersPage() {
  // En attente de la route de l'API qui renvoie les postes de l'entreprise connectée.
  const postes = []

  return (
    <>
      <h1>Mes postes</h1>

      {postes.length === 0 ? (
        <p>Vous n'avez pas encore publié de poste.</p>
      ) : (
        <ul>
          {postes.map((poste) => (
            <li key={poste.id}>{poste.title}</li>
          ))}
        </ul>
      )}

      <p><Link to="/recruteur/nouvelle-offre">Publier une nouvelle offre</Link></p>
    </>
  )
}
