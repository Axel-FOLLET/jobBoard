import JobOffer from '../components/AddJobOffer.jsx'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { apiFetch } from '../api.js'

// Page d'accueil : liste les annonces publiées, récupérées depuis /api/ads.
export default function JobBoardPage() {
  // Liste vide au départ, puis remplie par l'appel réseau ci-dessous.
  const [offers, setOffers] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  // ?q=… vient de la barre de recherche de l'accueil ; le filtre q est géré par l'API.
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''

  // À chaque changement de recherche : on redemande la liste à l'API.
  useEffect(() => {
    async function loadOffers() {
      setLoading(true)
      setError(null)
      try {
        const path = search === '' ? '/api/ads' : `/api/ads?q=${encodeURIComponent(search)}`
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
  }, [search])

  // Trois affichages possibles, dans cet ordre : chargement, erreur, puis la liste.
  if (loading) return <p>Chargement…</p>
  if (error) return <p>{error}</p>

  return (
    <div className="page">
      <h1 className="home-title">
        Votre prochain <span className="gradient">emploi</span>,
        <br />
        simplement.
      </h1>
      {/* Recherche venue de l'accueil : on rappelle le texte cherché et le cas sans résultat. */}
      {search !== '' && <p>Résultats pour « {search} » : {offers.length}</p>}
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
          />
        ))}
      </div>
    </div>
  )
}