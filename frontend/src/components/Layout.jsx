import { useContext } from 'react'
import { AuthContext } from '../AuthContext'
import { Outlet, NavLink, useNavigate } from 'react-router'

export default function Layout() {
  const { user, setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to log out')
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
    setUser(null)
    navigate('/')
  }

  return (
    <div>
      <header>
        <nav>
          <span>Y.I.A Jobs</span>
          <NavLink to="/">Job Board</NavLink>
          {user ? ( 
            <>
              <NavLink to="/account">Mon compte</NavLink>
              <NavLink to="/applications">Mes candidatures</NavLink>
              {user.role === 'admin' && <NavLink to="/admin">Administration</NavLink>}
              <button type="button" onClick={handleLogout}>Se déconnecter</button>
            </>
          ) : (
            <NavLink to="/login">Connexion</NavLink>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}