// Onglet « Publier une nouvelle offre » : champs repris du contrat d'API (table ads).
export default function RecruiterNewOfferPage() {
  return (
    <>
      <h1>Publier une nouvelle offre</h1>
      <p>Décrivez le poste à pourvoir.</p>

      {/* noValidate : les messages du navigateur seront remplacés par les nôtres, en français. */}
      <form noValidate>
        <label>
          Titre :
          <input type="text" name="title" />
        </label>

        <label>
          Description courte :
          <input type="text" name="short_description" />
        </label>

        <label>
          Description :
          <textarea name="description" />
        </label>

        <label>
          Salaire annuel brut :
          <input type="number" name="salary" min="0" />
        </label>

        <label>
          Localisation :
          <input type="text" name="location" />
        </label>

        <label>
          Temps de travail :
          <input type="text" name="working_time" />
        </label>

        <label>
          Type de contrat :
          <input type="text" name="contract_type" />
        </label>

        {/* Désactivé : POST /api/ads est réservé à l'administration (docs/contrat_api.md). */}
        <button type="submit" disabled>Publier — bientôt disponible</button>
      </form>
    </>
  )
}
