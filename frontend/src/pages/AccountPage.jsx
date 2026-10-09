import { useContext, useState } from 'react'
import { Link } from 'react-router'
import { AuthContext } from '../AuthContext'

// Nom de chaque champ de l'API, en français, pour le message « Il manque un champ »
const FIELD_NAMES = {
    first_name: 'prénom',
    last_name: 'nom',
    email: 'email',
    password: 'mot de passe',
    phone: 'téléphone',
}

export default function AccountPage() {
    const [firstName, setFirstName] = useState('') // État pour le prénom
    const [surname, setSurname] = useState('') // État pour le nom
    const [telephone, setTelephone] = useState('') // État pour le téléphone
    const [email, setEmail] = useState('') // État pour l'email
    const [password, setPassword] = useState('') // État pour le mot de passe
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle')
    const [sendError, setSendError] = useState('') // message affiché si l'envoi échoue
    const [needLogin, setNeedLogin] = useState(false) // email déjà utilisé (409)
    const { user } = useContext(AuthContext)

    const handleSubmit = async (event) => {
        event.preventDefault() // Empêche le rechargement de la page lors de la soumission du formulaire
        if (user || status === 'sending' || status === 'sent') return
        setSendError('')
        setNeedLogin(false)
        const newErrors = {}

        if (firstName.trim() === '') {
            console.log('Prénom manquant')
            newErrors.firstName = "Veuillez indiquer votre prénom."
            }
        else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(firstName.trim())) {
            newErrors.firstName = "Votre prénom ne peut contenir que des lettres, des espaces, des tirets ou des apostrophes."
        }

        if (surname.trim() === '') {
            console.log('Nom manquant')
            newErrors.surname = "Veuillez indiquer votre nom."
            } 
        else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(surname.trim())) {
            newErrors.surname = "Votre nom ne peut contenir que des lettres, des espaces, des tirets ou des apostrophes."  
        }

        if (telephone.trim() !== '' && !/^\+?[0-9 ]+$/.test(telephone.trim())) {
            newErrors.telephone = "Votre téléphone ne peut contenir que des chiffres, des espaces et un + au début."
        }

        if (email.trim() === '') {
            console.log('Email manquant')
            newErrors.email = "Veuillez indiquer un email valide."
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = "Votre email doit ressembler à nom@exemple.fr."
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
            first_name: firstName.trim(),
            last_name: surname.trim(),
            email: email.trim(),
            password: password,
        }
        if (telephone.trim() !== '') {
            body.phone = telephone.trim()
        }

        setSendError('')
        setNeedLogin(false)
        setStatus('sending')

        try {
            const response = await fetch(`/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (response.status === 201) {
                setStatus('sent')
                return
            }

            // Refus de l'API : le détail technique va dans la console, le candidat lit un message en français
            const data = await response.json()
            console.error(response.status, data.error)
            setStatus('error')

            if (response.status === 409) {
                setSendError('Cet email a déjà un compte. Connectez-vous.')
                setNeedLogin(true)
            } else if (response.status === 400) {
                if (data.error === 'Password must be at least 8 characters') {
                    setSendError('Le mot de passe doit contenir au moins 8 caractères.')
                } else if (typeof data.error === 'string' && data.error.startsWith('Invalid field: ')) {
                    const field = data.error.replace('Invalid field: ', '')
                    setSendError(`Merci de vérifier le champ : ${FIELD_NAMES[field] || 'informations du compte'}.`)
                } else {
                    setSendError('Merci de vérifier les informations du compte.')
                }
            } else {
                throw new Error(`Unexpected response ${response.status}`)
            }
        } catch (err) {
            // Serveur arrêté, réponse illisible ou code inattendu
            console.error(err)
            setStatus('error')
            setSendError("Nous n'arrivons pas à créer votre compte pour le moment. Merci de réessayer dans quelques instants.")
        }
    }

    if (user) {
        return <div className="page"><h1>Mon compte</h1></div>
    }

    return (
        <form onSubmit={handleSubmit} noValidate>

            <label>
                Nom :
                <input type="text" name="surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
            </label>
            {errors.surname && <p>{errors.surname}</p>}

            <label>
                Prénom :
                <input type="text" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            {errors.firstName && <p>{errors.firstName}</p>}

            <label>
                Téléphone :
                <input type="text" name="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </label>
            {errors.telephone && <p>{errors.telephone}</p>}

            <label>
                Email :
                <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {errors.email && <p>{errors.email}</p>}

            <label>
                Mot de passe :
                <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {errors.password && <p>{errors.password}</p>} 

            <button type="submit" disabled={status === 'sending' || status === 'sent'}>
                {status === 'sending' && <span className="spinner" aria-hidden="true"></span>}
                {status === 'sent' ? (
                    <>
                        <svg className="checkmark" viewBox="0 0 52 52" aria-hidden="true">
                            <path fill="none" stroke="currentColor" strokeWidth="5" d="M14 27 l8 8 l16 -16" />
                        </svg>
                        Compte créé
                    </>
                ) :status === 'sending' ? 'Création en cours…' : 'Créer un compte'}
            </button>
            <div aria-live="polite">
                {status === 'sent' && (
                    <p>Votre compte est créé. Vous pouvez vous connecter. <Link to="/login">Se connecter</Link></p>
                )}
                {sendError && (
                    <p role="alert">
                        {sendError} {needLogin && <Link to="/login">Se connecter</Link>}
                    </p>
                )}
            </div>
        </form>
    )
}
