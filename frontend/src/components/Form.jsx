import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AuthContext } from '../AuthContext'

const FIELD_NAMES = {
    first_name: 'prénom',
    last_name: 'nom',
    email: 'email',
    message: 'message',
}

export default function Form({ id, onClose }) {
    const { user } = useContext(AuthContext)
    const [firstName, setFirstName] = useState('')
    const [surname, setSurname] = useState('')
    const [telephone, setTelephone] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle')
    const [sendError, setSendError] = useState('')
    const [needLogin, setNeedLogin] = useState(false)

    // Laisse le V se dessiner avant de fermer le formulaire.
    useEffect(() => {
        if (status !== 'sent') return
        const timer = setTimeout(onClose, 1150)
        return () => clearTimeout(timer)
    }, [status, onClose])

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (status === 'sending' || status === 'sent') return

        setSendError('')
        setNeedLogin(false)
        const newErrors = {}

        // Les informations personnelles sont nécessaires aux visiteurs seulement.
        if (!user) {
            if (firstName.trim() === '') {
                newErrors.firstName = 'Veuillez indiquer votre prénom.'
            } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(firstName.trim())) {
                newErrors.firstName = 'Votre prénom ne peut contenir que des lettres, des espaces, des tirets ou des apostrophes.'
            }

            if (surname.trim() === '') {
                newErrors.surname = 'Veuillez indiquer votre nom.'
            } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(surname.trim())) {
                newErrors.surname = 'Votre nom ne peut contenir que des lettres, des espaces, des tirets ou des apostrophes.'
            }

            if (telephone.trim() !== '' && !/^\+?[0-9 ]+$/.test(telephone.trim())) {
                newErrors.telephone = 'Votre téléphone ne peut contenir que des chiffres, des espaces et un + au début.'
            }

            if (email.trim() === '') {
                newErrors.email = 'Veuillez indiquer un email valide.'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                newErrors.email = 'Votre email doit ressembler à nom@exemple.fr.'
            }
        }

        if (message.trim() === '') {
            newErrors.message = 'Veuillez indiquer votre message.'
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return

        // Si connecté, le serveur prend l'identité dans la session.
        const body = { message: message.trim() }

        if (!user) {
            body.first_name = firstName.trim()
            body.last_name = surname.trim()
            body.email = email.trim()
            if (telephone.trim() !== '') {
                body.phone = telephone.trim()
            }
        }

        setStatus('sending')

        try {
            const response = await fetch(`/api/ads/${id}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (response.status === 201) {
                setStatus('sent')
                return
            }

            const data = await response.json()
            console.error(response.status, data.error)
            setStatus('error')

            if (
                response.status === 400 &&
                typeof data.error === 'string' &&
                data.error.startsWith('Missing field: ')
            ) {
                const field = data.error.replace('Missing field: ', '')
                setSendError(`Il manque un champ : ${FIELD_NAMES[field] || field}.`)
            } else if (response.status === 409 && data.error === 'Already applied') {
                setSendError('Vous avez déjà candidaté à cette annonce.')
            } else if (response.status === 409 && data.error === 'Ad is closed') {
                setSendError('Cette annonce est clôturée : les candidatures ne sont plus possibles.')
            } else if (response.status === 401) {
                setSendError('Cet email correspond à un compte. Connectez-vous pour candidater.')
                setNeedLogin(true)
            } else {
                throw new Error(`Unexpected response ${response.status}`)
            }
        } catch (err) {
            console.error(err)
            setStatus('error')
            setSendError("Nous n'arrivons pas à envoyer votre candidature pour le moment. Merci de réessayer dans quelques instants.")
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            {user ? (
                <p>Vous candidatez en tant que {user.first_name} {user.last_name}.</p>
            ) : (
                <>
                    <label>
                        Nom :
                        <input type="text" name="surname" value={surname}
                            onChange={(event) => setSurname(event.target.value)} />
                    </label>
                    {errors.surname && <p>{errors.surname}</p>}

                    <label>
                        Prénom :
                        <input type="text" name="firstName" value={firstName}
                            onChange={(event) => setFirstName(event.target.value)} />
                    </label>
                    {errors.firstName && <p>{errors.firstName}</p>}

                    <label>
                        Téléphone :
                        <input type="text" name="telephone" value={telephone}
                            onChange={(event) => setTelephone(event.target.value)} />
                    </label>
                    {errors.telephone && <p>{errors.telephone}</p>}

                    <label>
                        Email :
                        <input type="email" name="email" value={email}
                            onChange={(event) => setEmail(event.target.value)} />
                    </label>
                    {errors.email && <p>{errors.email}</p>}
                </>
            )}

            <label>
                Message :
                <textarea name="message" value={message}
                    onChange={(event) => setMessage(event.target.value)} />
            </label>
            {errors.message && <p>{errors.message}</p>}

            <button type="submit" disabled={status === 'sending' || status === 'sent'}>
                {status === 'sending' && <span className="spinner" aria-hidden="true"></span>}
                {status === 'sent' ? (
                    <>
                        <svg className="checkmark" viewBox="0 0 52 52" aria-hidden="true">
                            <path fill="none" stroke="currentColor" strokeWidth="5"
                                d="M14 27 l8 8 l16 -16" />
                        </svg>
                        Envoyée
                    </>
                ) : status === 'sending' ? 'Envoi en cours…' : 'Envoyer'}
            </button>

            <div aria-live="polite">
                {status === 'sent' && (
                    <p className="visually-hidden">Votre candidature est envoyée.</p>
                )}
                {sendError && (
                    <p>
                        {sendError} {needLogin && <Link to="/login">Se connecter</Link>}
                    </p>
                )}
            </div>
        </form>
    )
}