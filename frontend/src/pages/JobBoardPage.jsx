import JobOffer from '../components/AddJobOffer.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { apiFetch } from '../api.js'

// Filtres de l'adresse transmis tels quels à l'API (docs/contrat_api.md, filtres de GET /api/ads).
const API_FILTERS = ['q', 'contract_type', 'location']

// liste les annonces publiées, récupérées depuis /api/ads.
export default function JobBoardPage() {
  // Liste vide au départ, puis remplie par l'appel réseau ci-dessous.
  const [offers, setOffers] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  // ?q=…&contract_type=…&location=… viennent de la barre de recherche (accueil ou cette page).
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const apiParams = new URLSearchParams()
  for (const name of API_FILTERS) {
    const value = searchParams.get(name)
    if (value) apiParams.set(name, value)
  }
  // Texte simple (« q=dev&location=Paris ») : l'effet ne repart que s'il change.
  const apiQuery = apiParams.toString()

  // À chaque changement de recherche ou de filtre : on redemande la liste à l'API.
  useEffect(() => {
    async function loadOffers() {
      setLoading(true)
      setError(null)
      try {
        const path = apiQuery === '' ? '/api/ads' : `/api/ads?${apiQuery}`
        const { ok, data, error: apiError } = await apiFetch(path)
        if (!ok) {
          throw new Error(apiError)
        }
        setOffers(data)
      } catch (err) {
        // Détail technique pour nous dans la console (F12), message lisible pour le visiteur.
        console.error(err)
        setError("Nous n'arrivons pas à charger les offres pour le moment. Merci de réessayer dans quelques instants.")
      } finally {
        // Dans tous les cas : on sort de l'état « chargement ».
        setLoading(false)
      }
    }
    loadOffers()
  }, [apiQuery])

  return (
    <div className="page offers-page">
      {/* Titre de page ordinaire, plus petit que celui de l'accueil : les résultats remontent. */}
      <h1>Offres d&apos;emploi</h1>

      {/* key : la barre est recréée quand l'adresse change, ses champs reprennent donc la recherche affichée. */}
      <SearchBar key={apiQuery} />

      {/* Trois affichages possibles, dans cet ordre : chargement, erreur, puis la liste. La barre reste visible. */}
      {loading && <p>Chargement…</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && (
        <>
          {/* Recherche ou filtres en cours : on rappelle le texte cherché et le nombre de résultats. */}
          {apiQuery !== '' && offers.length > 0 && (
            <p className="results-count">
              {offers.length} offre{offers.length > 1 ? 's' : ''}
              {search !== '' ? ` pour « ${search} »` : ' pour ces filtres'}
            </p>
          )}
          {offers.length === 0 && <p>Aucune offre ne correspond à cette recherche.</p>}
          {/* Une carte par annonce ; key sert à React seul, d'où id en plus. */}
          <div className="offers-grid">
            {offers.map((offer) => (
              <JobOffer
                key={offer.id}
                id={offer.id}
                company={offer.company}
                title={offer.title}
                shortDescription={offer.short_description}
                location={offer.location}
                contractType={offer.contract_type}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
