import { AuthContext } from "../AuthContext";
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router";

const tables = {
  companies: {
    title: "Entreprises",
    columns: [{ key: "id", label: "Identifiant" }, { key: "name", label: "Nom" }, { key: "description", label: "Description" }, { key: "location", label: "Lieu" }, { key: "website", label: "Site web" }],
  },
  categories: {
    title: "Catégories",
    columns: [{ key: "id", label: "Identifiant" }, { key: "name", label: "Nom" }],
  },
  people: {
    title: "Personnes",
    columns: [{ key: "id", label: "Identifiant" }, { key: "first_name", label: "Prénom" }, { key: "last_name", label: "Nom" }, { key: "email", label: "Email" }, { key: "phone", label: "Téléphone" }, { key: "role", label: "Rôle" }],
  },
  ads: {
    title: "Annonces",
    columns: [{ key: "id", label: "Identifiant" }, { key: "title", label: "Titre" }, { key: "short_description", label: "Description courte" }, { key: "description", label: "Description" }, { key: "salary", label: "Salaire" }, { key: "location", label: "Localisation" }, { key: "working_time", label: "Temps de travail" }, { key: "contract_type", label: "Type de contrat" }, { key: "status", label: "Statut" }, { key: "created_at", label: "Date de création" }, { key: "company_id", label: "Identifiant de l'entreprise" }, { key: "category_id", label: "Identifiant de la catégorie" }, { key: "contact_id", label: "Identifiant du contact" }],
  },
  applications: {
    title: "Candidatures",
    columns: [{ key: "id", label: "Identifiant" }, { key: "ad_id", label: "Identifiant de l'annonce" }, { key: "person_id", label: "Identifiant de la personne" }, { key: "message", label: "Message" }, { key: "status", label: "Statut" }, { key: "created_at", label: "Date de création" }],
  },
};

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const [selectedTable, setSelectedTable] = useState("companies");
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/${selectedTable}?page=${currentPage}&per_page=${perPage}`, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        setRows(data);
        setTotalPages(Math.ceil(Number(response.headers.get("X-Total-Count")) / perPage));
      } catch (err) {
        // message pour l'écran ; le détail technique reste dans la console
        setError("Nous n'arrivons pas à charger ces données pour le moment. Merci de réessayer dans quelques instants.");
        console.error("Erreur lors de la récupération des données :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTable, user, currentPage, perPage]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="page">
        <p>Cette page est réservée à l'administration.</p>
        {user === null && <Link to="/login">Se connecter</Link>}
      </div>
    )};

  return (
    <div className="page">
      <h1>Administration</h1>
      <div>
        {Object.keys(tables).map((table) => (
          <button key={table} type="button" onClick={() => {
            setSelectedTable(table);
            setCurrentPage(1);
          }}>
            {tables[table].title}
          </button>
        ))}
      </div>
      <h2>{tables[selectedTable].title}</h2>
      <label>Lignes par page :
        <select value={perPage} onChange={(e) => {
          setPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}>
          <option value={10}>10 par page</option>
          <option value={25}>25 par page</option>
          <option value={50}>50 par page</option>
        </select>
      </label>
      <div>
        {totalPages > 0  && (
          <>
          <button type="button" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Précédent
          </button>
          <span> Page {currentPage} sur {totalPages} </span>
          <button type="button" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Suivant
          </button>
          </>
        )}
      </div>
      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p>{error}</p>
      ) : rows.length === 0 ? (
        <p>Aucune donnée disponible pour l'instant.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {tables[selectedTable].columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {tables[selectedTable].columns.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
