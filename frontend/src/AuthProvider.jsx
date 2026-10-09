import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/auth/me')
                const userData = await response.json()
                if (response.status === 200) {
                    setUser(userData)
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchUser()
    }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}