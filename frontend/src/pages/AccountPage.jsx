// Page « Créer un compte » : formulaire d'inscription pour un visiteur.
import { useContext, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { AuthContext } from '../AuthContext'
import { apiFetch } from '../api.js'
import { FIELD_NAMES } from '../fieldNames.js'

// --- Page publique : formulaire de création de compte ---
export default function AccountPage() {
    // Champs du formulaire, vides au départ.
    const [firstName, setFirstName] = useState('')
    const [surname, setSurname] = useState('')
    const [telephone, setTelephone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // errors = un message par champ fautif ; status pilote le bouton.
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle')
    const [sendError, setSendError] = useState('')
    const [needLogin, setNeedLogin] = useState(false)
    const { user } = useContext(AuthContext)

    const handleSubmit = async (event) => {
        // Empêche le rechargement de la page lors de la soumission du formulaire.
        event.preventDefault()
        if (user || status === 'sending' || status === 'sent' || status === 'pending') return
        setSendError('')
        setNeedLogin(false)
        // Contrôles côté client avant l'envoi : un message par champ dans newErrors.
        const newErrors = {}

        if (firstName.trim() === '') {
            newErrors.firstName = "Veuillez indiquer votre prénom."
            }
        else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(firstName.trim())) {
            newErrors.firstName = "Votre prénom ne peut contenir que des lettres, des espaces, des tirets ou des apostrophes."
        }

        if (surname.trim() === '') {
            newErrors.surname = "Veuillez indiquer votre nom."
            } 
        else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(surname.trim())) {
            newErrors.surname = "Votre nom ne peut contenir que des lettres, des espaces, des tirets ou des apostrophes."  
        }

        // Téléphone facultatif : contrôlé seulement s'il est rempli.
        if (telephone.trim() !== '' && !/^\+?[0-9 ]+$/.test(telephone.trim())) {
            newErrors.telephone = "Votre téléphone ne peut contenir que des chiffres, des espaces et un + au début."
        }

        if (email.trim() === '') {
            newErrors.email = "Veuillez indiquer un email valide."
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = "Votre email doit ressembler à nom@exemple.fr."
        }

        if (password.trim() === '') {
            newErrors.password = "Veuillez indiquer votre mot de passe."
        }
        else if (password.includes(' ')) {
            newErrors.password = "Le mot de passe ne peut pas contenir d'espaces."
        }
        else if (password.length < 8) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères."
        }

        setErrors(newErrors)
        // Au moins une erreur de saisie : rien n'est envoyé au serveur.
        if (Object.keys(newErrors).length > 0) {
            return
        }


        // Les quatre champs obligatoires ; le téléphone n'est ajouté que s'il est rempli.
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
            const { status: httpStatus, error: apiError } = await apiFetch('/api/auth/register', {
                method: 'POST',
                body,
            })

            // 201 : le compte est créé mais pas connecté, la personne passe par /login.
            if (httpStatus === 201) {
                setStatus('sent')
                return
            }

            // 202 : l'adresse était déjà enregistrée sans compte. Rien n'est créé tant que
            // le lien envoyé à cette adresse n'a pas été ouvert : connaître un email ne
            // donne jamais la main sur la fiche de quelqu'un d'autre.
            if (httpStatus === 202) {
                setStatus('pending')
                return
            }

            // Refus de l'API : le détail technique va dans la console, le candidat lit un message en français.
            console.error(httpStatus, apiError)
            setStatus('error')

            // Un message français par code de l'API ; 409 propose la connexion.
            if (httpStatus === 409) {
                setSendError('Cet email a déjà un compte. Connectez-vous.')
                setNeedLogin(true)
            } else if (httpStatus === 400) {
                if (apiError === 'Password must be at least 8 characters') {
                    setSendError('Le mot de passe doit contenir au moins 8 caractères.')
                } else if (apiError.startsWith('Invalid field: ')) {
                    const field = apiError.replace('Invalid field: ', '')
                    setSendError(`Merci de vérifier le champ : ${FIELD_NAMES[field] || 'informations du compte'}.`)
                } else {
                    setSendError('Merci de vérifier les informations du compte.')
                }
            } else {
                throw new Error(`Unexpected response ${httpStatus}`)
            }
        } catch (err) {
            // Serveur arrêté, réponse illisible ou code inattendu.
            console.error(err)
            setStatus('error')
            setSendError("Nous n'arrivons pas à créer votre compte pour le moment. Merci de réessayer dans quelques instants.")
        }
    }

    // Déjà connecté : la modification de la fiche vit dans l'espace candidat, pas ici.
    if (user) {
        return <Navigate to="/espace-candidat/informations" replace />
    }

    // noValidate : les messages du navigateur sont remplacés par les nôtres, en français.
    return (
        <form className="registration-form" onSubmit={handleSubmit} noValidate>

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

            {/* Bouton verrouillé pendant l'envoi : spinner, puis coche. */}
            <button type="submit" disabled={status === 'sending' || status === 'sent' || status === 'pending'}>
                {status === 'sending' && <span className="spinner" aria-hidden="true"></span>}
                {status === 'sent' || status === 'pending' ? (
                    <>
                        <svg className="checkmark" viewBox="0 0 52 52" aria-hidden="true">
                            <path fill="none" stroke="currentColor" strokeWidth="5" d="M14 27 l8 8 l16 -16" />
                        </svg>
                        {status === 'sent' ? 'Compte créé' : 'Lien envoyé'}
                    </>
                ) :status === 'sending' ? 'Création en cours…' : 'Créer un compte'}
            </button>
            <div aria-live="polite">
                {status === 'sent' && (
                    <p>Votre compte est créé. Vous pouvez vous connecter. <Link to="/login">Se connecter</Link></p>
                )}
                {status === 'pending' && (
                    <p>
                        Votre adresse est déjà enregistrée chez nous, sans compte. Nous venons
                        d&apos;envoyer un lien de confirmation à {email.trim()} : votre compte
                        et vos candidatures seront accessibles dès que vous l&apos;aurez ouvert.
                    </p>
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
