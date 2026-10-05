import './App.css'
// On donne un nom (JobOffer) à ce que le fichier exporte par défaut
import JobOffer from './AddJobOffer.jsx'

function App() {
  // Tableau d'annonces (objets) : fausses données, remplacées par l'API au J3
  // Chaque annonce a ses propres valeurs isNew et remote (booléens true/false)
  const offers = [
    { id: 1, company: 'Natixis', jobTitle: 'Directeur des Services Informatiques', isNew: true, remote: false },
    { id: 2, company: 'Credit Agricole', jobTitle: 'Développeur Full Stack', isNew: false, remote: true },
    { id: 3, company: 'BPCE', jobTitle: 'Chef de Projet', isNew: true, remote: true },
  ]
  return (
    // Un seul parent : cette div englobe tout le reste
    <div>
      <h1>HireLoop</h1>
      {/* map : une carte JobOffer par annonce du tableau ; key = identifiant unique exigé par React */}
      {/* Les données de chaque annonce sont transmises à sa carte en props */}
      {offers.map((offer) => (
        <JobOffer
          key={offer.id}
          company={offer.company}
          jobTitle={offer.jobTitle}
          isNew={offer.isNew}
          remote={offer.remote}
        />
      ))}
    </div>
  )
}

// Permet à main.jsx d'importer et d'afficher App
export default App
