import { useContext, useState, useEffect } from "react";
import { Link } from "react-router";
import { AuthContext } from "../AuthContext";
import { apiFetch } from "../api.js";

// "2026-10-08 18:15:02" (UTC, comme le renvoie SQLite) -> "8 octobre 2026"
function formatDate(value) {
    return new Date(value.replace(" ", "T") + "Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Page « Mes candidatures » : réservée au visiteur connecté.
export default function ApplicationsPage() {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        async function fetchApplications() {
            try {
                // Lit pour l'instant un fichier de démonstration, pas l'API /api/me/applications.
                const { ok, data } = await apiFetch('/mock/my-applications.json');
                if (ok) setApplications(data);
            } catch (error) {
                // En cas d'échec la liste reste vide : la page affiche « pas encore candidaté ».
                console.error('Error fetching applications:', error);
            }
        }
        fetchApplications();
    }, []);

    return (
        <div className="applications-page">
            <h1>Mes candidatures</h1>
            {/* user à null = visiteur non connecté : on propose la connexion plutôt que la liste. */}
            {user === null ? (
                <Link to="/login">Connectez-vous pour voir vos candidatures.</Link>
            ) : (
                <>
                <p>Bienvenue, {user.first_name} ! Voici vos candidatures :</p>
                    {applications.length === 0 ? (
                        <Link to="/offres">Vous n'avez pas encore candidaté. Trouvez votre futur emploi !</Link>
                    ) : (<ul>
                            {applications.map((application) => (
                                <li key={application.id}>
                                    <h3>{application.title}</h3>
                                    <p>Entreprise : {application.company}</p>
                                    <p>Date de création : {formatDate(application.created_at)}</p>
                                    {/* Statuts de l'API traduits pour l'écran : pending, accepted, sinon refusée. */}
                                    <p className={`application-status status-${application.status}`}>Statut : {application.status === 'pending' ? 'En attente' : application.status === 'accepted' ? 'Retenue' : 'Refusée'}</p>
                                </li>
                            ))}
                        </ul>)}
                </>
            )}
        </div>
    );
}
