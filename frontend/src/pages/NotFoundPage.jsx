// Page affichée pour toute URL inconnue (route * dans App.jsx).
import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="page">
      <h1>Page introuvable</h1>
      {/* Une phrase calme et un seul chemin de retour. */}
      <p>Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link to="/">Retour à l&apos;accueil</Link>
    </div>
  );
}
