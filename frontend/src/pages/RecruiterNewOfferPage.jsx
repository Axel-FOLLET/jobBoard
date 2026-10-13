// Onglet « Publier une nouvelle offre » : champs repris du contrat d'API (table ads).
import { useState, useEffect } from 'react'
import { apiFetch } from '../api.js'

export default function RecruiterNewOfferPage() {
  // Suggestions de saisie : les lieux et contrats déjà présents dans les annonces ouvertes.
  const [suggestions, setSuggestions] = useState({ location: [], contract_type: [] })

  // Une fois : même calcul que la barre de recherche (components/SearchBar.jsx).
  useEffect(() => {
    async function loadSuggestions() {
      const { ok, data } = await apiFetch('/api/ads')
      // Sans réponse, les champs restent de la saisie libre.
      if (!ok) return
      const values = (key) => [...new Set(data.map((ad) => ad[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'))
      setSuggestions({ location: values('location'), contract_type: values('contract_type') })
    }
    loadSuggestions()
  }, [])

  return (
    <>
      <h1>Publier une nouvelle offre</h1>
      <p>Décrivez le poste à pourvoir.</p>

      {/* noValidate : les messages du navigateur seront remplacés par les nôtres, en français.
          form-columns (forms.css) : champs courts par paires, descriptions sur toute la ligne. */}
      <form className="form-columns" noValidate>
        <fieldset>
          <legend>Le poste</legend>
          <label className="field-wide">
            Titre
            <input type="text" name="title" />
          </label>

          <label className="field-wide">
            Description courte
            <input type="text" name="short_description" />
          </label>

          <label className="field-wide">
            Description
            <textarea name="description" />
          </label>
        </fieldset>

        <fieldset>
          <legend>Conditions</legend>
          <label>
            Salaire annuel brut
            <input type="number" name="salary" min="0" />
          </label>

          {/* list : suggestions proposées, une autre valeur reste possible (le contrat d'API n'impose pas de liste). */}
          <label>
            Lieu
            <input type="text" name="location" list="suggestions-location" />
          </label>

          <label>
            Temps de travail
            <input type="text" name="working_time" />
          </label>

          <label>
            Type de contrat
            <input type="text" name="contract_type" list="suggestions-contract" />
          </label>
        </fieldset>

        <datalist id="suggestions-location">
          {suggestions.location.map((value) => <option key={value} value={value} />)}
        </datalist>
        <datalist id="suggestions-contract">
          {suggestions.contract_type.map((value) => <option key={value} value={value} />)}
        </datalist>

        {/* Pas de bouton tant que POST /api/recruiter/ads (docs/contrat_api.md) n'existe pas dans le back :
            une phrase annonce la suite, plutôt qu'un bouton mort. */}
        <p className="form-note field-wide">La publication des offres sera ouverte dans une prochaine version.</p>
      </form>
    </>
  )
}
