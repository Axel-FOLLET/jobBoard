import JobOffer from '../components/AddJobOffer.jsx'
import { useState, useEffect } from 'react'

// useState : la « mémoire » fournie par React (accolades = on prend cet outil précis)
export default function JobBoardPage() {
  const [offers, setOffers] = useState([]) // liste vide au départ
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Une seule fois, au chargement de la page ([]) on définit l'état de la liste d'annonces
  useEffect(() => {
    async function loadOffers() {
      try {
        const response = await fetch('/api/ads')
        if (!response.ok) {
          throw new Error('Failed to fetch job offers')
        }
        const data = await response.json()
        setOffers(data)
      } catch (err) {
        console.error(err) // détail technique pour nous, dans la console (F12)
        setError("Nous n'arrivons pas à charger les offres pour le moment. Merci de réessayer dans quelques instants.")
      } finally {
        setLoading(false)
      }
    }
    loadOffers()
  }, [])

  // Affichage selon l'état : chargement, erreur, ou liste d'annonces
  if (loading) return <p>Chargement…</p>
  if (error) return <p>{error}</p>

  // Affichage des cartes
  return (
    <div className="page">
      <h1>Job Board</h1>
      {/* Une carte par annonce ; key sert à React seul, d'où id en plus */}
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
  )
}