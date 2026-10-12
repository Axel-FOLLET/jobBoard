// Onglet « Mon entreprise » : modification des informations de l'entreprise.
// Champs repris du contrat d'API (table companies) ; l'enregistrement reste à brancher.
export default function RecruiterCompanyPage() {
  return (
    <>
      <h1>Mon entreprise</h1>
      <p>Modifiez ici les informations vues par les candidats.</p>

      {/* noValidate : les messages du navigateur seront remplacés par les nôtres, en français. */}
      <form noValidate>
        <label>
          Nom :
          <input type="text" name="name" />
        </label>

        <label>
          SIREN :
          <input type="text" name="siren" inputMode="numeric" maxLength={9} />
        </label>

        <label>
          Description :
          <textarea name="description" />
        </label>

        <label>
          Lieu :
          <input type="text" name="location" />
        </label>

        <label>
          Site web :
          <input type="url" name="website" />
        </label>

        {/* Désactivé tant que l'API n'a pas de route de modification pour un recruteur. */}
        <button type="submit" disabled>Enregistrer — bientôt disponible</button>
      </form>
    </>
  )
}
