# Contrat de l'API Y.I.A Jobs

Version : J3 (schéma définitif, Blueprints, préfixe `/api`, filtres, inscription et connexion)

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

## Comptes : inscription et connexion

Routes sous `/api/auth`. Il n'y a pas encore de session : la connexion renvoie seulement les informations du compte (les sessions arrivent au J4).

| Route | Succès | Erreurs |
|---|---|---|
| `POST /api/auth/register` | 201 : le compte créé | 400 champ manquant ou mot de passe de moins de 8 caractères ; 409 email déjà utilisé |
| `POST /api/auth/login` | 200 : le compte connecté | 400 champ manquant ; 401 email ou mot de passe incorrect |

### Corps des requêtes

`POST /api/auth/register`

| Champ | Obligatoire | Remarque |
|---|---|---|
| `first_name` | oui | |
| `last_name` | oui | |
| `email` | oui | espaces retirés et lettres passées en minuscules avant l'enregistrement |
| `password` | oui | 8 caractères minimum |
| `phone` | non | |

Le champ `role` n'est pas lu : un compte créé par l'inscription a toujours le rôle `user`.

`POST /api/auth/login` : `email` et `password` sont obligatoires. L'email est normalisé comme à l'inscription (`TEST@Example.com` retrouve `test@example.com`).

### Format de réponse

Pour `POST /api/auth/register` et `POST /api/auth/login` :

```json
{
  "id": 4,
  "first_name": "Alice",
  "last_name": "Test",
  "email": "alice.test@example.com",
  "phone": null,
  "role": "user"
}
```

Clés : `id`, `first_name`, `last_name`, `email`, `phone`, `role`. Aucune réponse ne contient le mot de passe ni son empreinte (`password_hash`).

### Erreurs

| Code | Message | Cas |
|---|---|---|
| 400 | `Missing field: <nom du champ>` | champ obligatoire absent ou vide |
| 400 | `Password must be at least 8 characters` | mot de passe trop court (inscription) |
| 409 | `Email already used` | email déjà enregistré (casse et espaces ignorés) |
| 401 | `Invalid credentials` | email inconnu, mot de passe faux ou compte sans mot de passe : le même message dans les trois cas |

---

## À venir

- J4 : refus de candidature sur une annonce fermée (code d'erreur à définir), clôture transactionnelle d'une annonce, CRUD complet.
- J4 (comptes) : sessions, déconnexion, compte courant et modification du compte.
- J5 : pagination et contrôles supplémentaires.
