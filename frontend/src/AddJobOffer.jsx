// useState : la « mémoire » fournie par React (accolades = on prend cet outil précis)
import { useState } from 'react'

// La carte reçoit les données de SON annonce en props
export default function JobOffer({ company, jobTitle, isNew, remote }) {
      // Mémoire propre à chaque carte : showDetails = valeur à lire (false au départ = détail fermé),
      // setShowDetails = fonction pour la changer ET prévenir React de redessiner la carte
      const [showDetails, setShowDetails] = useState(false)
    // Au clic : inverse la mémoire (! = « le contraire de » : fermé ↔ ouvert)
    function handleClick() {
        setShowDetails(!showDetails)
    }

  return (
    <div className="job-offer">
      <h2>{company}</h2>
      {/* && : affiché seulement si isNew vaut true, sinon rien */}
      {isNew && <span>Nouveau</span>}
      {/* onClick reçoit la fonction (sans parenthèses) ; ternaire : le texte du bouton suit l'état */}
      <button onClick={handleClick}>{showDetails ? 'Hide details' : 'View details'}</button>
      <p>{jobTitle}</p>
      {/* Détail affiché seulement si showDetails vaut true ; ternaire : choisit entre deux textes */}
      {showDetails && <p>{remote ? 'Télétravail possible' : 'Sur site'}</p>}
    </div>
  )
}
