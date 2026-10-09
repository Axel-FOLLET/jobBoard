import { useEffect, useState } from 'react'
import { Link } from 'react-router'

// Nom de chaque champ de l'API, en français, pour le message « Il manque un champ »
const FIELD_NAMES = {
    first_name: 'prénom',
    last_name: 'nom',
    email: 'email',
    message: 'message',
}

export default function Form ({ id, onClose }) {
    const [firstName, setFirstName] = useState('') // État pour le prénom
    const [surname, setSurname] = useState('') // État pour le nom
    const [telephone, setTelephone] = useState('') // État pour le téléphone
    const [email, setEmail] = useState('') // État pour l'email
    const [message, setMessage] = useState('') // État pour le message
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle')
    const [sendError, setSendError] = useState('') // message affiché si l'envoi échoue
    const [needLogin, setNeedLogin] = useState(false) // vrai si l'API demande de se connecter (401)

    // Après l'envoi : on laisse le V se dessiner (0,6 s), puis le formulaire se ferme tout seul
    useEffect(() => {
        if (status !== 'sent') return
        const timer = setTimeout(onClose, 1150)
        return () => clearTimeout(timer)
    }, [status, onClose])

    const handleSubmit = async (event) => {
        event.preventDefault() // Empêche le rechargement de la page lors de la soumission du formulaire
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

        if (message.trim() === '') {
            console.log('Message manquant')
            newErrors.message = "Veuillez indiquer votre message."
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            return
        }


        const body = {
            first_name: firstName.trim(),
            last_name: surname.trim(),
            email: email.trim(),
            message: message.trim(),
        }
        if (telephone.trim() !== '') {
            body.phone = telephone.trim()
        }

        setSendError('')
        setNeedLogin(false)
        setStatus('sending')

        try {
            const response = await fetch(`/api/ads/${id}/applications`, {
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

            if (response.status === 400 && data.error.startsWith('Missing field: ')) {
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
            // Serveur arrêté, réponse illisible ou code inattendu
            console.error(err)
            setStatus('error')
            setSendError("Nous n'arrivons pas à envoyer votre candidature pour le moment. Merci de réessayer dans quelques instants.")
        }
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
                Message :
                <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            {errors.message && <p>{errors.message}</p>}

            <button type="submit" disabled={status === 'sending' || status === 'sent'}>
                {status === 'sending' && <span className="spinner" aria-hidden="true"></span>}
                {status === 'sent' ? (
                    <>
                        <svg className="checkmark" viewBox="0 0 52 52" aria-hidden="true">
                            <path fill="none" stroke="currentColor" strokeWidth="5" d="M14 27 l8 8 l16 -16" />
                        </svg>
                        Envoyée
                    </>
                ) :status === 'sending' ? 'Envoi en cours…' : 'Envoyer'}
            </button>
            <div aria-live="polite">
                {/* Le V n'a pas de texte : la phrase est lue par les lecteurs d'écran, sans s'afficher */}
                {status === 'sent' && <p className="visually-hidden">Votre candidature est envoyée.</p>}
                {sendError && (
                    <p>
                        {sendError} {needLogin && <Link to="/login">Se connecter</Link>}
                    </p>
                )}
            </div>
        </form>
    )
}