# Contrat de l'API Y.I.A Jobs

Version : J3 (schéma définitif, Blueprints, préfixe `/api`, filtres)

- Toutes les routes sont sous le préfixe **`/api`**. Les anciennes URL sans préfixe (`/ads`...) renvoient 404.
- Toutes les réponses sont en **JSON**.
- Les corps de requête `POST` sont en JSON (`Content-Type: application/json`).
- Serveur de développement : `http://localhost:5000`.

---

## Routes

| Route | Succès | Erreurs |
|---|---|---|
| `GET /api/ads` | 200 : tableau d'annonces **ouvertes**, de la plus récente à la plus ancienne | aucune (200 et `[]` si aucun résultat) |
| `GET /api/ads/<id>` | 200 : annonce complète (**même fermée**) | 404 `Ad not found` |
| `GET /api/companies/<id>/ads` | 200 : tableau d'annonces **ouvertes** de l'entreprise (`[]` possible) | 404 `Company not found` |
| `POST /api/ads` | 201 : l'annonce créée (même format que le détail) | 400 champ manquant, ou `company_id` / `category_id` inconnu |
| `POST /api/ads/<id>/applications` | 201 : la candidature créée | 400 champ manquant ou `person_id` inconnu ; 404 annonce inconnue ; 409 déjà postulé |

Ordre des vérifications de `POST /api/ads/<id>/applications` : 400 (champ manquant), puis 404 (annonce inconnue), puis insertion (409 ou 400 selon la contrainte violée).

---

## Filtres de `GET /api/ads`

Tous **facultatifs** et **combinables** (assemblés avec AND).

| Paramètre | Rôle | Exemple |
|---|---|---|
| `q` | texte contenu dans `title` ou `short_description` (la casse est ignorée pour les lettres sans accent) | `?q=python` |
| `category` | nom de catégorie exact | `?category=Data` |
| `contract_type` | type de contrat exact | `?contract_type=CDI` |
| `location` | lieu exact | `?location=Londres` |

Exemple combiné : `GET /api/ads?contract_type=CDI&location=Londres`

Règles :

- Sans filtre, la route renvoie toutes les annonces ouvertes, triées par `created_at` puis `id` décroissants.
- Un filtre sans résultat renvoie **200** et `[]`.
- Les annonces `closed` sont **toujours exclues** de cette liste, même si elles correspondent aux filtres.
- Les valeurs de filtre doivent être **encodées en URL** (`encodeURIComponent` ou `URLSearchParams` côté front). Sans encodage, les caractères accentués (par exemple `Développement`) ne donnent aucun résultat.

---

## Formats de réponse

Les noms de clés sont imposés : le front les lit tels quels.

### Liste d'annonces

Pour `GET /api/ads` et `GET /api/companies/<id>/ads` :

```json
[
  {
    "id": 3,
    "title": "Cybersécurité",
    "short_description": "Blue team",
    "company": "TechNova",
    "location": "Londres",
    "contract_type": "CDI",
    "status": "open",
    "created_at": "2026-10-07 10:04:10"
  }
]
```

Clés : `id`, `title`, `short_description`, `company`, `location`, `contract_type`, `status`, `created_at`.

### Détail d'une annonce

Pour `GET /api/ads/<id>` et la réponse de `POST /api/ads` :

```json
{
  "id": 1,
  "title": "Développeur Python",
  "short_description": "Back-end Flask",
  "description": "you will dev many website",
  "salary": 42000,
  "location": "Paris",
  "working_time": "Temps plein",
  "contract_type": "CDI",
  "status": "open",
  "created_at": "2026-10-07 10:04:10",
  "company": "TechNova",
  "category": "Développement",
  "contact_id": 1
}
```

Clés : `id`, `title`, `short_description`, `description`, `salary`, `location`, `working_time`, `contract_type`, `status`, `created_at`, `company`, `category`, `contact_id`.

- `company` et `category` sont des **noms**, pas des identifiants.
- Les champs facultatifs non renseignés valent `null`.

### Candidature

Pour la réponse de `POST /api/ads/<id>/applications` :

```json
{
  "id": 5,
  "ad_id": 3,
  "person_id": 1,
  "message": "Bonjour, je suis intéressé.",
  "status": "pending",
  "created_at": "2026-10-07 10:30:00"
}
```

Clés : `id`, `ad_id`, `person_id`, `message`, `status`, `created_at`.

---

## Corps des requêtes `POST`

### `POST /api/ads`

| Champ | Obligatoire | Remarque |
|---|---|---|
| `title` | oui | |
| `short_description` | oui | |
| `company_id` | oui | doit exister |
| `category_id` | oui | doit exister |
| `description` | non | |
| `salary` | non | entier |
| `location` | non | |
| `working_time` | non | |
| `contract_type` | non | |
| `contact_id` | non | doit exister s'il est fourni |

Le `status` d'une nouvelle annonce est `open` (valeur par défaut, non modifiable à la création).

### `POST /api/ads/<id>/applications`

| Champ | Obligatoire |
|---|---|
| `person_id` | oui |
| `message` | oui |

Le `status` d'une nouvelle candidature est `pending` (valeur par défaut).

---

## Statuts

| Champ | Valeurs | Défaut |
|---|---|---|
| `ads.status` | `open`, `closed` | `open` |
| `applications.status` | `pending`, `accepted`, `rejected` | `pending` |

- Une annonce `closed` n'apparaît pas dans les listes publiques (`GET /api/ads`, `GET /api/companies/<id>/ads`), mais son détail reste consultable et indique son statut.
- Ces statuts sont un choix d'équipe, appliqués par des contraintes `CHECK` dans la base.

---

## Format des erreurs

Toute erreur est un objet JSON avec une seule clé `error` :

```json
{"error": "Ad not found"}
```

Messages utilisés :

| Code | Message | Cas |
|---|---|---|
| 400 | `Missing field: <nom du champ>` | champ obligatoire absent ou vide |
| 400 | `Unknown company_id or category_id` | `POST /api/ads` avec une clé étrangère inconnue |
| 400 | `Unknown person_id` | `POST .../applications` avec un `person_id` inconnu |
| 404 | `Ad not found` | annonce inexistante |
| 404 | `Company not found` | entreprise inexistante |
| 409 | `Already applied` | la personne a déjà postulé à cette annonce |

---

## Suppressions protégées (base de données)

Les clés étrangères sont en `ON DELETE RESTRICT` : on ne peut pas supprimer une entreprise, une catégorie ou une personne référencée par une annonce, ni une annonce qui a des candidatures. Cette règle est appliquée par la base ; aucune route de suppression n'existe à ce stade.

---

## À venir

- J4 : refus de candidature sur une annonce fermée (code d'erreur à définir), clôture transactionnelle d'une annonce, CRUD complet.
- J5 : pagination et contrôles supplémentaires.
