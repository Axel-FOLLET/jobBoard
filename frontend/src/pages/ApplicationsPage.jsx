import { useContext, useState, useEffect } from "react";
import { Link } from "react-router";
import { AuthContext } from "../AuthContext";

// "2026-10-08 18:15:02" (UTC, comme le renvoie SQLite) -> "8 octobre 2026"
function formatDate(value) {
    return new Date(value.replace(" ", "T") + "Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ApplicationsPage() {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await fetch('/mock/my-applications.json');
                const data = await response.json();
                setApplications(data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        }
        fetchApplications();
    }, []);

    return (
        <div className="applications-page">
            <h1>Mes candidatures</h1>
            {user === null ? (
                <Link to="/login">Connectez-vous pour voir vos candidatures.</Link>
            ) : (
                <>
                <p>Bienvenue, {user.first_name} ! Voici vos candidatures :</p>
                    {applications.length === 0 ? (
                        <Link to="/">Vous n'avez pas encore candidaté. Trouvez votre futur emploi !</Link>
                    ) : (<ul>
                            {applications.map((application) => (
                                <li key={application.id}>
                                    <h3>{application.title}</h3>
                                    <p>Entreprise : {application.company}</p>
                                    <p>Date de création : {formatDate(application.created_at)}</p>
                                    <p>Statut : {application.status === 'pending' ? 'En attente' : application.status === 'accepted' ? 'Retenue' : 'Refusée'}</p>
                                </li>
                            ))}
                        </ul>)}
                </>
            )}
        </div>
    );
}