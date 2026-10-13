// Onglet « Mon entreprise » : modification des informations de l'entreprise.
// Champs repris du contrat d'API (table companies) ; l'enregistrement attend PATCH /api/recruiter/company.
export default function RecruiterCompanyPage() {
  return (
    <>
      <h1>Mon entreprise</h1>
      <p>Modifiez ici les informations vues par les candidats.</p>

      {/* noValidate : les messages du navigateur seront remplacés par les nôtres, en français.
          form-columns (forms.css) : champs courts par paires, description sur toute la ligne. */}
      <form className="form-columns" noValidate>
        <label>
          Nom
          <input type="text" name="name" />
        </label>

        <label>
          SIREN
          <input type="text" name="siren" inputMode="numeric" maxLength={9} />
        </label>

        <label className="field-wide">
          Description
          <textarea name="description" />
        </label>

        <label>
          Lieu
          <input type="text" name="location" />
        </label>

        <label>
          Site web
          <input type="url" name="website" />
        </label>

        {/* Pas de bouton tant que PATCH /api/recruiter/company (docs/contrat_api.md) n'existe pas dans le back :
            une phrase annonce la suite, plutôt qu'un bouton mort. */}
        <p className="form-note field-wide">L'enregistrement de ces informations sera ouvert dans une prochaine version.</p>
      </form>
    </>
  )
}
