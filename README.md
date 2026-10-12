# Y.I.A Jobs — Job Board

> À jour du 12/10/2026, fin du J6.

Y.I.A Jobs (initiales de Yohan, Ismail et Axel) est une plateforme d’annonces d’emploi développée avec React, Flask et SQLite.
Projet Epitech réalisé à trois : Axel FOLLET (chef de projet, front-end), Yohan AVRONSART (back-end : données et métier) et Ismail BASSIT (back-end : comptes et sécurité).

## Technologies

| Partie | Outils |
| --- | --- |
| Base de données | SQLite (fichier `backend/jobboard.db`) |
| Back-end / API | Python, Flask 3, sessions par cookie, python-dotenv |
| Front-end | React 19, React Router 8, Vite 8, ESLint |

## Structure du dépôt
```
JobBoard/
├── backend/                     API Flask et base de données
│   ├── app.py                   crée l'application et enregistre les blueprints (port 5000)
│   ├── db.py                    ouverture de la base (clés étrangères activées)
│   ├── auth_utils.py            clé secrète, cookie de session, personne connectée, @login_required, @admin_required
│   ├── routes/
│   │   ├── ads.py               annonces, candidatures, « Mes candidatures », clôture
│   │   ├── admin.py             CRUD d'administration des cinq tables
│   │   ├── auth.py              inscription, connexion, déconnexion, compte
│   │   └── verification.py      confirmation de l'adresse email
│   ├── pending_registrations.py inscriptions en attente de confirmation de l'adresse
│   ├── mailer.py                envoi des emails (SMTP), désactivable
│   ├── create_admin.py          crée le compte administrateur à partir du .env
│   ├── schema.sql               création des tables
│   ├── seed.sql                 données de test
│   ├── init_db.py               crée jobboard.db à partir de schema.sql et seed.sql
│   ├── data/annonces.json       données des annonces pour le remplissage de la base
│   ├── queries.sql              requêtes d'exemple
│   ├── checks.sql               insertions qui doivent échouer (tests des contraintes)
│   ├── curl_tests.md            tests de l'API (commandes, codes, réponses)
│   ├── tests/curl_auth.md       tests de l'inscription et de la connexion
│   ├── .env.example             modèle du fichier de configuration
│   └── requirements.txt
├── docs/
│   └── contrat_api.md           contrat de l'API : routes, champs, codes, messages d'erreur
└── frontend/                    interface React (Vite)
    ├── index.html
    ├── vite.config.js           proxy des appels /api vers l'API Flask
    └── src/
        ├── App.jsx              routes de l'interface
        ├── api.js               point d'accès unique à l'API (cookie, JSON, erreurs)
        ├── AuthProvider.jsx     personne connectée, partagée par toutes les pages
        ├── adminTables.js       description des cinq tables pour l'administration
        ├── components/          barre de navigation, carte d'annonce, formulaire de candidature, formulaire du compte
        └── pages/               une page par adresse
```

## Prérequis

- Python 3
- Node.js (testé avec v24) et npm

## Installation et lancement

### Back-end

Les commandes suivantes s’exécutent depuis la racine du dépôt, dans un terminal WSL ou Linux. `init_db.py` recrée les tables : les données existantes sont supprimées. Il faut le relancer après toute modification de `schema.sql`.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # puis remplacer les valeurs « change-me » (voir Configuration)
python init_db.py               # crée jobboard.db et affiche le nombre de lignes par table
python create_admin.py          # crée l'administrateur décrit dans .env
python app.py                   # API sur http://localhost:5000
```

Sous Windows avec PowerShell, l’activation du venv se fait avec `.\venv\Scripts\Activate.ps1`.

### Front-end

Dans un second terminal, depuis la racine du dépôt :
```bash
cd frontend
npm install
npm run dev                     # interface sur http://localhost:5173
```
Le serveur de développement de Vite transmet à Flask tous les appels dont l’adresse commence par `/api` (proxy configuré dans
`vite.config.js`) : le navigateur ne parle qu'à une seule origine, ce qui évite les erreurs CORS.

## Configuration
Le back-end utilise `jobboard.db`, dans son dossier de lancement, et le port 5000. Le proxy Vite cible `http://localhost:5000`.

La configuration est lue dans `backend/.env`, jamais dans le code. Ce fichier n'est pas suivi par Git : `.env.example` en donne le modèle.

| Clé | Rôle |
| --- | --- |
| `SECRET_KEY` | signe le cookie de session ; l'API refuse de démarrer sans elle |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | compte administrateur créé par `create_admin.py` |
| `COOKIE_SECURE` | `1` pour n'envoyer le cookie qu'en HTTPS (facultatif) |
| `APP_BASE_URL` | adresse du site, utilisée dans le lien de confirmation envoyé par email |
| `MAIL_ENABLED` | `1` pour envoyer les emails ; `0` ou absent : rien n'est envoyé, le message s'affiche dans le terminal de l'API |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | serveur d'envoi des emails |

Le cookie de session est `HttpOnly` et `SameSite=Lax`. Les mots de passe sont enregistrés hachés.

## Base de données

| Table | Rôle | Colonnes principales |
| --- | --- | --- |
| `companies` | entreprises | id, name, description, location, website |
| `categories` | catégories d'annonces | id, name (unique) |
| `people` | candidats, comptes et responsables d'annonces | id, first_name, last_name, email (unique), phone, password_hash, role (`user` / `admin`) |
| `ads` | annonces | id, title, short_description, description, salary, location, working_time, contract_type, status (`open` / `closed`), created_at, company_id, category_id, contact_id |
| `applications` | candidatures | id, ad_id, person_id, message, status (`pending` / `accepted` / `rejected`), created_at |
| `pending_registrations` | inscriptions en attente de confirmation de l'adresse | id, person_id (unique), token_hash (unique), first_name, last_name, phone, password_hash, created_at, expires_at |

Relations :
- une entreprise publie plusieurs annonces (`ads.company_id`) ;
- une annonce appartient à une seule catégorie (`ads.category_id`) et a un responsable (`ads.contact_id`) ;
- une personne peut postuler à plusieurs annonces et une annonce recevoir plusieurs candidatures (table `applications`) ;
- une personne ne peut pas postuler deux fois à la même annonce (`UNIQUE (ad_id, person_id)`).

Les clés étrangères des cinq tables principales sont en `ON DELETE RESTRICT` : la base refuse de supprimer une entreprise, une catégorie ou une personne encore référencée, ni une annonce qui a des candidatures. Les statuts et le rôle sont limités à leurs valeurs par des contraintes `CHECK`.

Une personne qui a candidaté sans compte est enregistrée dans `people` sans mot de passe. Si elle crée ensuite son compte avec le même email, l'inscription attend dans `pending_registrations` qu'elle ouvre le lien envoyé à cette adresse : connaître un email ne donne jamais accès au compte ni aux candidatures de quelqu'un d'autre. Le jeton du lien n'est enregistré que haché ; il est valable 24 heures et ne sert qu'une fois. Cette table est créée automatiquement au premier usage si la base existe déjà.

## Routes de l'API
Toutes les routes sont sous `/api` et répondent en JSON. Le détail des champs, des codes et des messages est dans [`docs/contrat_api.md`](docs/contrat_api.md).

| Méthode | Route | Accès | Fonction |
| --- | --- | --- | --- |
| GET | `/api/ads` | public | Lister les annonces ouvertes, avec filtres et pagination facultatifs |
| GET | `/api/ads/<id>` | public | Obtenir le détail d’une annonce (même fermée) |
| GET | `/api/companies/<id>/ads` | public | Lister les annonces ouvertes d’une entreprise |
| POST | `/api/ads/<id>/applications` | public | Enregistrer une candidature, avec ou sans compte |
| POST | `/api/auth/register` | public | Créer un compte |
| POST | `/api/auth/verify` | public | Confirmer l'adresse d'une inscription en attente |
| POST | `/api/auth/login` | public | Se connecter (ouvre la session) |
| POST | `/api/auth/logout` | public | Se déconnecter |
| GET, PATCH | `/api/auth/me` | connecté | Lire ou modifier son compte |
| GET | `/api/me/applications` | connecté | Lister ses candidatures |
| POST | `/api/ads` | admin | Créer une annonce |
| POST | `/api/ads/<id>/closure` | admin | Clôturer une annonce et désigner la candidature retenue |
| GET | `/api/admin/<table>` | admin | Lister les lignes d'une table, avec pagination |
| GET | `/api/admin/<table>/<id>` | admin | Lire une ligne |
| POST | `/api/admin/<table>` | admin | Créer une ligne |
| PATCH | `/api/admin/<table>/<id>` | admin | Modifier une ligne |
| DELETE | `/api/admin/<table>/<id>` | admin | Supprimer une ligne |

Les tables de l'administration sont `companies`, `categories`, `people`, `ads` et `applications`. Filtres de `GET /api/ads`, tous facultatifs et combinables : `q` (texte dans le titre ou la description courte), `category`, `contract_type` et `location` (valeurs exactes). Les annonces fermées n’apparaissent jamais dans les listes. Pagination : `page` et `per_page` (1 à 50) ; le nombre total de lignes est renvoyé dans l'en-tête `X-Total-Count`.

Les routes renvoient 200 en lecture, 201 à la création, 202 pour une inscription en attente de confirmation, 204 après une suppression, 400 pour une requête invalide, 401 sans connexion ou pour un identifiant incorrect, 403 sans le rôle administrateur, 404 pour une ressource inexistante et 409 pour un doublon ou une ligne encore référencée. Les erreurs ont toujours la forme `{"error": "..."}`. Aucune réponse ne contient de mot de passe ni d'empreinte. Les commandes et résultats des vérifications sont dans `backend/curl_tests.md` et `backend/tests/curl_auth.md`.

## Pages
Navigation sans rechargement de la page (React Router), avec une barre commune : la page active est marquée et le logo ramène à l'accueil. Le menu dépend de la personne : « Offres d'emploi » et « Espace recruteur » pour tous, « Connexion » pour un visiteur, « Espace candidat » et « Se déconnecter » une fois connecté, « Administration » pour un administrateur. Sur mobile, il se replie derrière un bouton « Menu ».

| Adresse | Page |
| --- | --- |
| `/` | Accueil : barre de recherche et les deux offres les plus récentes |
| `/offres` | Offres d'emploi : liste des annonces ouvertes, filtrée par la recherche de l'accueil |
| `/login` | Connexion |
| `/account` | Création de compte |
| `/verification` | Confirmation de l'adresse, ouverte depuis le lien reçu par email |
| `/espace-candidat` | Espace candidat, onglet « Mes candidatures » |
| `/espace-candidat/informations` | Espace candidat, onglet « Mes informations » : modification du compte |
| `/recruteur` | Espace recruteur, onglet « Vue d'ensemble » |
| `/recruteur/entreprise` | Espace recruteur, onglet « Mon entreprise » |
| `/recruteur/postes` | Espace recruteur, onglet « Mes postes » |
| `/recruteur/nouvelle-offre` | Espace recruteur, onglet « Publier une offre » |
| `/admin` | Administration : les cinq tables, avec création, modification, suppression et pagination |
| autre adresse | Page introuvable |

Les onglets des espaces candidat et recruteur sont des boutons, comme le choix des tables en administration. L'espace candidat demande d'être connecté : un visiteur y trouve un lien vers la connexion. « Mes candidatures » lit pour l'instant un fichier de démonstration, pas encore l'API. L'administration est réservée aux administrateurs : sinon, la page affiche un message sans rien demander à l'API. L'espace recruteur est en place côté interface mais pas encore relié à l'API : ses listes restent vides.

Sur chaque annonce, le bouton « En savoir plus » affiche dans la carte toutes les informations de l’annonce, sans fenêtre modale ; un message signale le chargement ou l’échec d’une requête. Le bouton « Postuler » ouvre sous l’annonce le formulaire de candidature, avec ou sans compte. Les textes de l’interface sont en français.

## Évolutions prévues

Le planning sera revu après la soutenance de mi-parcours du 14/10. Ces fonctionnalités ne sont pas encore réalisées :

- J7 : clôture d’une annonce depuis l’interface, emails de réception, d’acceptation et de refus, début du design.
- J8 : vérification des parcours et de l’installation sur une machine neuve.
- Bonus, seulement si le temps le permet : relier l’espace recruteur à l’API.

Le lancement du projet final à partir du build React sera documenté lorsqu’il sera en place.

## Auteurs

- Axel FOLLET
- Yohan AVRONSART
- Ismail BASSIT
