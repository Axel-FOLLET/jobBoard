// Habillage de l'espace recruteur : ses onglets, puis la sous-page courante.
import { NavLink, Outlet } from 'react-router'

export default function RecruiterLayout() {
  return (
    <div className="page">
      {/* Onglets en pastilles, comme le choix des tables en administration. */}
      <nav className="tab-switch" aria-label="Espace recruteur">
        <NavLink to="/recruteur" end>Vue d'ensemble</NavLink>
        <NavLink to="/recruteur/entreprise">Mon entreprise</NavLink>
        <NavLink to="/recruteur/postes">Mes postes</NavLink>
        <NavLink to="/recruteur/nouvelle-offre">Publier une offre</NavLink>
      </nav>

      {/* Outlet : la sous-page correspondant à l'URL s'affiche ici. */}
      <Outlet />
    </div>
  )
}
