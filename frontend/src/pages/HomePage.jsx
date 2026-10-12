// Page d'accueil : une barre de recherche d'emploi, puis les deux offres les plus récentes.
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { apiFetch } from '../api.js'
import JobOffer from '../components/AddJobOffer.jsx'

export default function HomePage() {
  const [query, setQuery] = useState('')
  // Les deux offres les plus récentes : la liste reste vide tant que l'appel n'a pas répondu.
  const [recent, setRecent] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // La recherche est faite par la page des offres : on l'ouvre avec le texte saisi.
  function handleSearch(event) {
    event.preventDefault()
    const text = query.trim()
    navigate(text === '' ? '/offres' : `/offres?q=${encodeURIComponent(text)}`)
  }

  // La zone de saisie suit la hauteur du texte : height à auto, puis la hauteur réelle du contenu.
  function handleChange(event) {
    setQuery(event.target.value)
    event.target.style.height = 'auto'
    event.target.style.height = `${event.target.scrollHeight}px`
  }

  // Entrée lance la recherche, Maj+Entrée laisse écrire sur une deuxième ligne.
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSearch(event)
    }
  }

  // Une seule fois, au chargement : per_page=2 suffit, l'API trie déjà de la plus récente à la plus ancienne.
  useEffect(() => {
    async function loadRecent() {
      try {
        const { ok, data, error: apiError } = await apiFetch('/api/ads?page=1&per_page=2')
        if (!ok) {
          throw new Error(apiError)
        }
        setRecent(data)
      } catch (err) {
        // Détail technique dans la console, message lisible pour le visiteur.
        console.error(err)
        setError("Nous n'arrivons pas à charger les offres récentes pour le moment.")
      } finally {
        setLoading(false)
      }
    }
    loadRecent()
  }, [])

  return (
    <div className="page">
      <h1 className="home-title">
        Votre prochain <span className="gradient">emploi</span>,
        <br />
        simplement.
      </h1>

      {/* Encadré de l'accueil : la recherche en haut, les deux offres récentes en dessous. */}
      <div className="home-panel">
        {/* noValidate : un champ vide ouvre simplement la liste complète, sans message du navigateur. */}
        <form className="home-search" onSubmit={handleSearch} noValidate role="search">
          <label htmlFor="home-search-input">Quel poste recherchez-vous ?</label>
          {/* Le cadre entoure le champ et la flèche : il grandit avec le texte, comme une zone de composition. */}
          <div className="home-search-box">
            <textarea
              id="home-search-input"
              name="q"
              rows={1}
              placeholder="Développeur, data, alternance…"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            {/* Flèche vers la droite : le libellé reste lisible par un lecteur d'écran grâce à aria-label. */}
            <button type="submit" className="home-search-submit" aria-label="Lancer la recherche">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <section className="recent-offers">
          <h2>Offres récentes</h2>
          {loading && <p>Chargement…</p>}
          {error && <p>{error}</p>}
          {/* Aucune annonce ouverte : on renvoie vers la liste plutôt que d'afficher une case vide. */}
          {!loading && !error && recent.length === 0 && (
            <p>Aucune offre pour le moment.</p>
          )}
          <div className="offers-grid">
            {recent.map((offer) => (
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
          {/* Lien présenté comme un bouton : la navigation reste un lien, l'aspect est celui d'un bouton. */}
          <Link className="button-link" to="/offres">Voir toutes les offres</Link>
        </section>
      </div>
    </div>
  )
}
