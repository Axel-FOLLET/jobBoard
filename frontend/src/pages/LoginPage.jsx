import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [sendError, setSendError] = useState('')
  const [status, setStatus] = useState('idle')
  const [destination, setDestination] = useState(null)
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  // Même délai que dans Apply pour laisser le V se dessiner avant de changer de page.
  useEffect(() => {
    if (status !== 'sent') return
    const timer = setTimeout(() => navigate(destination), 1150)
    return () => clearTimeout(timer)
  }, [status, destination, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending' || status === 'sent') return
    setSendError('')
    const newErrors = {}

    if (email.trim() === '') {
        console.log('Email manquant')
        newErrors.email = "Veuillez indiquer votre email."
    }

    if (password.trim() === '') {
        console.log('Mot de passe manquant')
        newErrors.password = "Veuillez indiquer votre mot de passe."
    }
    else if (password.includes(' ')) {
        console.log('Mot de passe invalide')
        newErrors.password = "Le mot de passe ne peut pas contenir d'espaces."
    }
    else if (password.length < 8) {
        console.log('Mot de passe trop court')
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères."
    }

    setErrors(newErrors)
      if (Object.keys(newErrors).length > 0) {
          return
      }

    const body = {
        email: email.trim(),
        password: password,
    }
        setSendError('')
        setStatus('sending')

        try {
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (response.status === 200) {
                const userData = await response.json()
                setUser(userData)
                setDestination(userData.role === 'admin' ? '/admin' : '/')
                setStatus('sent')
                return
            }

            // Refus de l'API : le détail technique va dans la console, le candidat lit un message en français
            const data = await response.json()
            console.error(response.status, data.error)
            setStatus('error')

            if (response.status === 400) {
                setSendError("Merci de vérifier l'email et le mot de passe.")
            } else if (response.status === 401) {
                setSendError('Email ou mot de passe incorrect.')
            } else {
                throw new Error(`Unexpected response ${response.status}`)
            }
        } catch (err) {
            // Serveur arrêté, réponse illisible ou code inattendu
            console.error(err)
            setStatus('error')
            setSendError("Nous n'arrivons pas à vous connecter pour le moment. Merci de réessayer dans quelques instants.")
        }
  }

  return (
    <div className="page">
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p>{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p>{errors.password}</p>}
        </div>
        <button type="submit" disabled={status === 'sending' || status === 'sent'}>
          {status === 'sending' && <span className="spinner" aria-hidden="true"></span>}
          {status === 'sent' ? (
            <>
              <svg className="checkmark" viewBox="0 0 52 52" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="5" d="M14 27 l8 8 l16 -16" />
              </svg>
              Connecté
            </>
          ) : status === 'sending' ? 'Connexion en cours…' : 'Se connecter'}
        </button>
        {sendError && <p role="alert">{sendError}</p>}
        <div aria-live="polite">
          {status === 'sent' && <p className="visually-hidden">Connexion réussie.</p>}
        </div>
      </form>
      <p><Link to="/account">Pas encore de compte ? Créer un compte</Link></p>
    </div>
  )
}
