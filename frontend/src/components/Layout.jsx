import { Outlet, NavLink } from 'react-router'

export default function Layout() {
  return (
    <div>
      <header>
        <nav>
          <span>Y.I.A Jobs</span>
          <NavLink to="/">Job Board</NavLink>
          <NavLink to="/login">Connexion</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}