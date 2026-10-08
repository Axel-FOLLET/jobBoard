# Contrat de l'API Y.I.A Jobs

Version : J4 (schéma définitif, Blueprints, préfixe `/api`, filtres, inscription, connexion, sessions, candidatures, clôture et CRUD admin)

- Toutes les routes sont sous le préfixe **`/api`**. Les anciennes URL sans préfixe (`/ads`...) renvoient 404.
- Toutes les réponses sont en **JSON**, sauf les réponses `204 No Content`.
- Les corps de requête `POST` et `PATCH` sont en JSON (`Content-Type: application/json`).
- Serveur de développement : `http://localhost:5000`.
- Les routes d'administration nécessitent une connexion avec un compte ayant le rôle `admin`.

---

## Routes publiques

| Route                         | Succès                                                                       | Erreurs                                                     |
| ----------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `GET /api/ads`                | 200 : tableau d'annonces **ouvertes**, de la plus récente à la plus ancienne | aucune (200 et `[]` si aucun résultat)                      |
| `GET /api/ads/<id>`           | 200 : annonce complète (**même fermée**)                                     | 404 `Ad not found`                                          |
| `GET /api/companies/<id>/ads` | 200 : tableau d'annonces **ouvertes** de l'entreprise (`[]` possible)        | 404 `Company not found`                                     |
| `POST /api/ads`               | 201 : l'annonce créée                                                        | 400 champ manquant, ou `company_id` / `category_id` inconnu |

---

# Filtres de `GET /api/ads`

Tous **facultatifs** et **combinables** (assemblés avec AND).

| Paramètre       | Rôle                                              | Exemple              |
| --------------- | ------------------------------------------------- | -------------------- |
| `q`             | texte contenu dans `title` ou `short_description` | `?q=python`          |
| `category`      | nom de catégorie exact                            | `?category=Data`     |
| `contract_type` | type de contrat exact                             | `?contract_type=CDI` |
| `location`      | lieu exact                                        | `?location=Londres`  |

Exemple combiné :

`GET /api/ads?contract_type=CDI&location=Londres`

Règles :

- Sans filtre, la route renvoie toutes les annonces ouvertes, triées par `created_at` puis `id` décroissants.
- Un filtre sans résultat renvoie **200** et `[]`.
- Les annonces `closed` sont **toujours exclues** de cette liste, même si elles correspondent aux filtres.
- Les valeurs de filtre doivent être **encodées en URL** (`encodeURIComponent` ou `URLSearchParams` côté front).

---

# Candidatures

La route :

`POST /api/ads/<id>/applications`

permet de candidater de **deux façons**.

## 1. Candidature en tant que visiteur

Un utilisateur non connecté doit fournir ses informations personnelles.

### Corps de la requête

| Champ        | Obligatoire | Remarque                                         |
| ------------ | ----------- | ------------------------------------------------ |
| `first_name` | oui         |                                                  |
| `last_name`  | oui         |                                                  |
| `email`      | oui         | espaces retirés et lettres passées en minuscules |
| `message`    | oui         |                                                  |
| `phone`      | non         |                                                  |

Exemple :

```json
{
  "first_name": "Alice",
  "last_name": "Test",
  "email": "Alice@Example.com",
  "message": "Bonjour, je suis intéressée.",
  "phone": "0600000000"
}
```

L'email est normalisé avant la recherche ou la création de la personne.

Si aucune personne n'existe avec cet email, une nouvelle personne est créée.

Si une personne existe déjà et possède un compte protégé par un mot de passe, la candidature est refusée :

```json
{
  "error": "Login required for this email"
}
```

avec le code **401**.

Si la personne existe mais ne possède pas de mot de passe, elle peut être réutilisée.

---

## 2. Candidature en tant qu'utilisateur connecté

Un utilisateur connecté n'a pas besoin de fournir son nom ni son email.

Seul le message est obligatoire :

```json
{
  "message": "Bonjour, je suis intéressé."
}
```

Le `person_id` est automatiquement récupéré depuis le compte connecté.

Il n'est donc pas nécessaire d'envoyer :

- `first_name`
- `last_name`
- `email`
- `person_id`

Le `person_id` utilisé pour la candidature correspond à l'utilisateur actuellement connecté.

---

## Vérifications de `POST /api/ads/<id>/applications`

Ordre général des vérifications :

1. vérification des champs obligatoires ;
2. vérification de l'existence de l'annonce ;
3. vérification que l'annonce n'est pas fermée ;
4. identification ou création de la personne ;
5. vérification d'une éventuelle candidature déjà existante ;
6. insertion de la candidature.

### Erreurs

| Code | Message                         | Cas                                              |
| ---- | ------------------------------- | ------------------------------------------------ |
| 400  | `Missing field: <nom du champ>` | champ obligatoire absent ou vide                 |
| 401  | `Login required for this email` | une personne existante possède un compte protégé |
| 404  | `Ad not found`                  | annonce inexistante                              |
| 409  | `Ad is closed`                  | l'annonce est fermée                             |
| 409  | `Already applied`               | la personne a déjà postulé à cette annonce       |

Une candidature créée retourne **201**.

---

# Formats de réponse

## Liste d'annonces

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

---

## Détail d'une annonce

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

---

## Candidature

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

# Corps des requêtes `POST`

## `POST /api/ads`

| Champ               | Obligatoire | Remarque                     |
| ------------------- | ----------- | ---------------------------- |
| `title`             | oui         |                              |
| `short_description` | oui         |                              |
| `company_id`        | oui         | doit exister                 |
| `category_id`       | oui         | doit exister                 |
| `description`       | non         |                              |
| `salary`            | non         | entier                       |
| `location`          | non         |                              |
| `working_time`      | non         |                              |
| `contract_type`     | non         |                              |
| `contact_id`        | non         | doit exister s'il est fourni |

Le `status` d'une nouvelle annonce est `open`.

---

# Clôture d'une annonce

Route :

`POST /api/ads/<id>/closure`

Cette route est réservée aux utilisateurs ayant le rôle `admin`.

Elle permet de fermer une annonce et de définir la candidature acceptée.

## Sans candidature

Si aucune candidature n'existe pour l'annonce, aucun `accepted_application_id` n'est nécessaire.

```json
{}
```

L'annonce passe alors à :

```text
status = closed
```

## Avec des candidatures

Si l'annonce possède des candidatures, le champ suivant est obligatoire :

```json
{
  "accepted_application_id": 5
}
```

La candidature sélectionnée passe à :

```text
accepted
```

Toutes les autres candidatures de cette annonce passent à :

```text
rejected
```

L'annonce passe ensuite à :

```text
closed
```

Toutes ces modifications sont effectuées dans **une seule transaction**.

## Erreurs

| Code | Message                                  | Cas                                                        |
| ---- | ---------------------------------------- | ---------------------------------------------------------- |
| 401  | `Login required`                         | utilisateur non connecté                                   |
| 403  | `Admin only`                             | utilisateur connecté mais non administrateur               |
| 400  | `Missing field: accepted_application_id` | des candidatures existent mais aucune n'est sélectionnée   |
| 400  | `Application does not belong to this ad` | la candidature sélectionnée appartient à une autre annonce |
| 404  | `Ad not found`                           | annonce inexistante                                        |
| 409  | `Ad already closed`                      | annonce déjà fermée                                        |

---

# CRUD d'administration

Toutes les routes CRUD suivantes sont réservées aux administrateurs.

Sans connexion :

```json
{
  "error": "Login required"
}
```

→ **401**

Avec un compte connecté mais sans rôle `admin` :

```json
{
  "error": "Admin only"
}
```

→ **403**

---

## Tables accessibles

Le CRUD admin autorise uniquement les tables suivantes :

- `companies`
- `categories`
- `people`
- `ads`
- `applications`

Toute autre table retourne :

```json
{
  "error": "Unknown table"
}
```

→ **404**

---

## Routes CRUD

### Liste

`GET /api/admin/<table>`

Retourne tous les enregistrements de la table.

### Détail

`GET /api/admin/<table>/<id>`

Retourne un enregistrement.

Si l'enregistrement n'existe pas :

```json
{
  "error": "Record not found"
}
```

→ **404**

### Création

`POST /api/admin/<table>`

Crée un nouvel enregistrement.

### Modification

`PATCH /api/admin/<table>/<id>`

Modifie uniquement les champs autorisés.

### Suppression

`DELETE /api/admin/<table>/<id>`

Supprime un enregistrement.

Succès :

**204 No Content**

---

# Champs modifiables du CRUD

## `companies`

Champs disponibles :

```text
id
name
description
location
website
```

Champs modifiables :

```text
name
description
location
website
```

Champ obligatoire à la création :

```text
name
```

---

## `categories`

Champs disponibles :

```text
id
name
```

Champ modifiable :

```text
name
```

Champ obligatoire à la création :

```text
name
```

---

## `people`

Champs disponibles :

```text
id
first_name
last_name
email
phone
role
```

Champs modifiables :

```text
first_name
last_name
email
phone
role
```

Champs obligatoires à la création :

```text
first_name
last_name
email
```

Le champ `password_hash` n'est jamais retourné et ne peut pas être modifié par ce CRUD.

L'email est normalisé en minuscules et sans espaces avant l'enregistrement.

---

## `ads`

Champs disponibles :

```text
id
title
short_description
description
salary
location
working_time
contract_type
status
created_at
company_id
category_id
contact_id
```

Champs modifiables :

```text
title
short_description
description
salary
location
working_time
contract_type
company_id
category_id
contact_id
```

Champs obligatoires à la création :

```text
title
short_description
company_id
category_id
```

Les champs `status` et `created_at` ne sont pas modifiables par le CRUD.

---

## `applications`

Champs disponibles :

```text
id
ad_id
person_id
message
status
created_at
```

Champs modifiables :

```text
ad_id
person_id
message
```

Champs obligatoires à la création :

```text
ad_id
person_id
message
```

Les champs `status` et `created_at` ne sont pas modifiables par le CRUD.

---

# Erreurs du CRUD

| Code | Message                      | Cas                                                     |
| ---- | ---------------------------- | ------------------------------------------------------- |
| 400  | `Missing field: <nom>`       | champ obligatoire absent ou vide                        |
| 400  | `Unknown field: <nom>`       | champ non autorisé                                      |
| 400  | `No fields to update`        | `PATCH` sans champ à modifier                           |
| 400  | `Unknown reference`          | clé étrangère inconnue                                  |
| 400  | `Invalid value`              | valeur refusée par une contrainte `CHECK`               |
| 400  | `Database error`             | autre erreur de base de données                         |
| 404  | `Unknown table`              | table non autorisée                                     |
| 404  | `Record not found`           | enregistrement inexistant                               |
| 409  | `Already exists`             | violation d'une contrainte `UNIQUE`                     |
| 409  | `Record is still referenced` | suppression impossible car l'enregistrement est utilisé |
| 401  | `Login required`             | utilisateur non connecté                                |
| 403  | `Admin only`                 | utilisateur non administrateur                          |

---

# Règles importantes du CRUD

- Les tables accessibles sont limitées à celles définies dans le contrat.
- Les champs accessibles en écriture sont limités aux champs modifiables définis ci-dessus.
- `password_hash` n'est jamais retourné par les réponses du CRUD.
- `status` et `created_at` des annonces et candidatures ne sont pas modifiables par le CRUD.
- Les clés étrangères sont vérifiées par la base de données.
- Les erreurs de contrainte sont transformées en réponses JSON correspondant au contrat.
- Une suppression réussie retourne **204 No Content**.

---

# Statuts

| Champ                 | Valeurs                           | Défaut    |
| --------------------- | --------------------------------- | --------- |
| `ads.status`          | `open`, `closed`                  | `open`    |
| `applications.status` | `pending`, `accepted`, `rejected` | `pending` |

- Une annonce `closed` n'apparaît pas dans les listes publiques (`GET /api/ads`, `GET /api/companies/<id>/ads`), mais son détail reste consultable et indique son statut.
- Une candidature ne peut pas être créée sur une annonce `closed`.
- Lors de la clôture d'une annonce avec des candidatures, une candidature est `accepted` et toutes les autres sont `rejected`.
- Ces statuts sont appliqués par des contraintes `CHECK` dans la base.

---

# Format des erreurs

Toute erreur est un objet JSON avec une seule clé `error` :

```json
{
  "error": "Ad not found"
}
```

---

# Comptes : inscription et connexion

Routes sous `/api/auth`.

La connexion crée une **session Flask** permettant d'identifier l'utilisateur connecté.

| Route                     | Succès                                             | Erreurs                                                                              |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `POST /api/auth/register` | 201 : le compte créé                               | 400 champ manquant ou mot de passe de moins de 8 caractères ; 409 email déjà utilisé |
| `POST /api/auth/login`    | 200 : le compte connecté et création de la session | 400 champ manquant ; 401 `Invalid credentials`                                       |

## Corps des requêtes

### `POST /api/auth/register`

| Champ        | Obligatoire | Remarque                                         |
| ------------ | ----------- | ------------------------------------------------ |
| `first_name` | oui         |                                                  |
| `last_name`  | oui         |                                                  |
| `email`      | oui         | espaces retirés et lettres passées en minuscules |
| `password`   | oui         | 8 caractères minimum                             |
| `phone`      | non         |                                                  |

Le champ `role` n'est pas lu : un compte créé par l'inscription a toujours le rôle `user`.

### `POST /api/auth/login`

`email` et `password` sont obligatoires.

L'email est normalisé comme à l'inscription.

Une connexion réussie crée une session contenant l'identifiant de l'utilisateur.

---

# Format de réponse

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

Clés :

`id`, `first_name`, `last_name`, `email`, `phone`, `role`.

Aucune réponse ne contient le mot de passe ni son empreinte (`password_hash`).

---

# Erreurs des comptes

| Code | Message                                  | Cas                                                          |
| ---- | ---------------------------------------- | ------------------------------------------------------------ |
| 400  | `Missing field: <nom du champ>`          | champ obligatoire absent ou vide                             |
| 400  | `Password must be at least 8 characters` | mot de passe trop court                                      |
| 409  | `Email already used`                     | email déjà enregistré                                        |
| 401  | `Invalid credentials`                    | email inconnu, mot de passe faux ou compte sans mot de passe |

---

# Authentification et autorisations

La fonction `current_user()` permet d'identifier l'utilisateur connecté grâce à la session.

Les routes protégées utilisent :

```text
@login_required
```

ou :

```text
@admin_required
```

### Utilisateur non connecté

```json
{
  "error": "Login required"
}
```

→ **401**

### Utilisateur connecté mais non administrateur

```json
{
  "error": "Admin only"
}
```

→ **403**

### Administrateur

L'accès aux routes d'administration et à la clôture des annonces est autorisé.

---

# Suppressions protégées

Les clés étrangères sont en `ON DELETE RESTRICT`.

Une entreprise, une catégorie ou une personne référencée ne peut pas être supprimée.

Une annonce qui possède des candidatures ne peut pas être supprimée.

Dans ce cas, le CRUD retourne :

```json
{
  "error": "Record is still referenced"
}
```

avec le code **409**.

---

# J5

- Pagination.
- Contrôles supplémentaires.
- Déconnexion.
- Consultation et modification du compte courant si prévues par le contrat final.
