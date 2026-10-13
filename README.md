# PROJECT JOB BOARD - Y.I.A Jobs

> À jour du 13/10/2026, fin du J7.

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
│   │   ├── recruiter.py         catégories, espace recruteur (son entreprise et ses annonces)
│   │   └── verification.py      confirmation de l'adresse e-mail
│   ├── pending_registrations.py inscriptions en attente de confirmation de l'adresse
│   ├── mailer.py                envoi des e-mails (SMTP), désactivable
│   ├── login_limit.py           limite des essais de connexion (5 échecs en 15 minutes)
│   ├── create_admin.py          crée le compte administrateur à partir du .env
│   ├── schema.sql               création des tables
│   ├── seed.sql                 données de test
│   ├── init_db.py               crée jobboard.db à partir de schema.sql et seed.sql
│   ├── seed_data.py             remplit la base à partir de data/annonces.json (une seule fois)
│   ├── migrate_siren.py         ajoute le SIREN à une base existante sans la réinitialiser
│   ├── data/annonces.json       données des annonces pour le remplissage de la base
│   ├── queries.sql              requêtes d'exemple
│   ├── checks.sql               insertions qui doivent échouer (tests des contraintes)
│   ├── curl_tests.md            tests de l'API (commandes, codes, réponses)
│   ├── tests/curl_auth.md       tests de l'inscription et de la connexion
│   ├── tests/test_login_limit.py tests automatiques de la limite de connexion (unittest)
│   ├── .env.example             modèle du fichier de configuration
│   └── requirements.txt
├── docs/
│   ├── contrat_api.md           contrat de l'API : routes, champs, codes, messages d'erreur
│   ├── choix_techniques_front.md            choix techniques du front-end
│   ├── choix_techniques_back_donnees.md     choix techniques du back-end : données et API
│   ├── choix_techniques_comptes_securite.md choix techniques du back-end : comptes et sécurité
│   ├── usage_ia.md              usage de l'IA par chaque membre de l'équipe
│   └── YIA_Jobs_soutenance.pptx support de la soutenance (et sa version PDF)
└── frontend/                    interface React (Vite)
    ├── index.html
    ├── vite.config.js           proxy des appels /api vers l'API Flask
    └── src/
        ├── App.jsx              routes de l'interface
        ├── api.js               point d'accès unique à l'API (cookie, JSON, erreurs)
        ├── AuthProvider.jsx     personne connectée, partagée par toutes les pages
        ├── adminTables.js       description des cinq tables pour l'administration
        ├── components/          habillage commun, pied de page, barre de recherche, carte d'annonce, formulaires
        ├── pages/               une page par adresse
        └── styles/              feuilles de style, une par usage
```

## Prérequis

- Python 3 (testé avec 3.13 et 3.14)
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
python seed_data.py             # ajoute une cinquantaine d'annonces (à relancer seulement après init_db.py)
python create_admin.py          # crée l'administrateur décrit dans .env
python app.py                   # API sur http://localhost:5000
```

Sous Windows avec PowerShell, le venv s’active avec `.\venv\Scripts\Activate.ps1`.

### Front-end

Dans un second terminal, depuis la racine du dépôt :
```bash
cd frontend
npm install
npm run dev                     # interface sur http://localhost:5173
```

Vite transmet à Flask tous les appels dont l’adresse commence par `/api` (proxy de `vite.config.js`) : le navigateur ne parle qu'à une seule origine, ce qui évite les erreurs CORS.

## Configuration

Le back-end utilise `jobboard.db`, dans son dossier de lancement, et le port 5000, que cible le proxy Vite.

La configuration est lue dans `backend/.env`, jamais dans le code. Ce fichier n'est pas suivi par Git : `.env.example` en donne le modèle.

| Clé | Rôle |
| --- | --- |
| `SECRET_KEY` | signe le cookie de session ; l'API refuse de démarrer sans elle |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | compte administrateur créé par `create_admin.py` |
| `COOKIE_SECURE` | `1` pour n'envoyer le cookie qu'en HTTPS (facultatif) |
| `APP_BASE_URL` | adresse du site, utilisée dans le lien de confirmation envoyé par e-mail |
| `MAIL_ENABLED` | `1` pour envoyer les e-mails ; `0` ou absent : rien n'est envoyé, le message s'affiche dans le terminal de l'API |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | serveur d'envoi des e-mails |

Le cookie de session est `HttpOnly` et `SameSite=Lax` ; sa signature expire au bout d'un jour. Les mots de passe sont enregistrés hachés (`scrypt`).

## Base de données

| Table | Rôle | Colonnes principales |
| --- | --- | --- |
| `companies` | entreprises | id, name, description, location, website, siren (9 chiffres, unique) |
| `categories` | catégories d'annonces | id, name (unique) |
| `people` | candidats, comptes et responsables d'annonces | id, first_name, last_name, email (unique), phone, password_hash, role (`user` / `admin`), company_id |
| `ads` | annonces | id, title, short_description, description, salary, location, working_time, contract_type, status (`open` / `closed`), created_at, company_id, category_id, contact_id |
| `applications` | candidatures | id, ad_id, person_id, message, status (`pending` / `accepted` / `rejected`), created_at |
| `pending_registrations` | inscriptions en attente de confirmation de l'adresse | id, person_id (unique), token_hash (unique), first_name, last_name, phone, password_hash, created_at, expires_at |

```text
companies 1 ───< N ads N >─── 1 categories
    1             N
    │             │ contact_id (responsable de l'annonce)
    │             1
    └─────────< N people          (company_id : recruteurs rattachés)

ads 1 ───< N applications N >─── 1 people   (person_id : candidat)

people 1 ─── 0..1 pending_registrations     (inscription en attente)
```

Relations :
- une entreprise publie plusieurs annonces (`ads.company_id`) ;
- une annonce appartient à une seule catégorie (`ads.category_id`) et a un responsable (`ads.contact_id`) ;
- un recruteur est rattaché à une entreprise (`people.company_id`), par l'administration uniquement ;
- une personne peut postuler à plusieurs annonces et une annonce recevoir plusieurs candidatures (table `applications`) ;
- une personne ne peut pas postuler deux fois à la même annonce (`UNIQUE (ad_id, person_id)`) ;
- une personne sans `password_hash` (candidat sans compte) existe en base mais ne peut pas se connecter.

Deux règles surprennent à la lecture :
- **Aucune suppression en cascade.** Les clés étrangères des cinq tables principales sont en `ON DELETE RESTRICT` : la base refuse de supprimer une entreprise, une catégorie ou une personne encore référencée, et une annonce qui a des candidatures. Il faut d'abord supprimer ou réaffecter ce qui y fait référence (l'API répond alors 409 `Record is still referenced`).
- **Les valeurs autorisées sont tenues par la base**, avec des contraintes `CHECK` : `ads.status`, `applications.status`, `people.role` et le format de `companies.siren`. Une valeur hors liste est refusée même si elle ne passe pas par l'API.

Une personne qui a candidaté sans compte est enregistrée dans `people` sans mot de passe. Si elle crée ensuite son compte avec la même adresse, l'inscription attend dans `pending_registrations` qu'elle ouvre le lien envoyé à cette adresse : connaître un e-mail ne donne jamais accès au compte ni aux candidatures de quelqu'un d'autre. Le jeton du lien n'est enregistré que haché ; il est valable 24 heures et ne sert qu'une fois. Cette table est créée automatiquement au premier usage si la base existe déjà.

## Routes de l'API

Toutes les routes sont sous `/api` et répondent en JSON. Le détail des champs, des codes et des messages est dans [`docs/contrat_api.md`](docs/contrat_api.md).

Accès : **public** (sans connexion), **connecté** (session ouverte), **recruteur** (connecté et rattaché à une entreprise), **admin** (compte de rôle `admin`).

| Méthode | Route | Accès | Fonction | Codes |
| --- | --- | --- | --- | --- |
| GET | `/api/ads` | public | Lister les annonces ouvertes, avec filtres et pagination facultatifs | 200, 400 |
| GET | `/api/ads/<id>` | public | Obtenir le détail d’une annonce (même fermée) | 200, 404 |
| GET | `/api/companies/<id>/ads` | public | Lister les annonces ouvertes d’une entreprise | 200, 404 |
| GET | `/api/categories` | public | Lister les catégories | 200 |
| POST | `/api/ads/<id>/applications` | public | Enregistrer une candidature, avec ou sans compte | 201, 400, 401, 404, 409 |
| POST | `/api/auth/register` | public | Créer un compte (ouvre la session) | 201, 202, 400, 409 |
| POST | `/api/auth/verify` | public | Confirmer l'adresse d'une inscription en attente | 200, 400, 409 |
| POST | `/api/auth/login` | public | Se connecter (ouvre la session) | 200, 400, 401, 429 |
| POST | `/api/auth/logout` | public | Se déconnecter | 204 |
| GET, PATCH | `/api/auth/me` | connecté | Lire ou modifier son compte (sauf l'adresse e-mail) | 200, 400, 401, 409 |
| GET | `/api/me/applications` | connecté | Lister ses candidatures | 200, 401 |
| GET, PATCH | `/api/recruiter/company` | recruteur | Lire ou modifier son entreprise (sauf le SIREN) | 200, 400, 401, 403 |
| GET, POST | `/api/recruiter/ads` | recruteur | Lister les annonces de son entreprise ou en publier une | 200, 201, 400, 401, 403 |
| POST | `/api/ads` | admin | Créer une annonce | 201, 400, 401, 403 |
| POST | `/api/ads/<id>/closure` | admin | Clôturer une annonce et désigner la candidature retenue | 200, 400, 401, 403, 404, 409 |
| GET | `/api/admin/<table>` | admin | Lister les lignes d'une table, avec pagination | 200, 400, 401, 403, 404 |
| GET | `/api/admin/<table>/<id>` | admin | Lire une ligne | 200, 401, 403, 404 |
| POST | `/api/admin/<table>` | admin | Créer une ligne | 201, 400, 401, 403, 404, 409 |
| PATCH | `/api/admin/<table>/<id>` | admin | Modifier une ligne | 200, 400, 401, 403, 404, 409 |
| DELETE | `/api/admin/<table>/<id>` | admin | Supprimer une ligne | 204, 401, 403, 404, 409 |

Un recruteur est une personne connectée dont la fiche est rattachée à une entreprise : le serveur lit cette entreprise dans la base, jamais dans la requête.

Filtres de `GET /api/ads`, tous facultatifs et combinables : `q` (texte dans le titre ou la description courte), `category`, `contract_type` et `location` (valeurs exactes). Les annonces fermées n’apparaissent jamais dans les listes. Pagination : `page` et `per_page` (1 à 50) ; le nombre total de lignes est renvoyé dans l'en-tête `X-Total-Count`.

Les routes renvoient 200 en lecture, 201 à la création, 202 pour une inscription en attente de confirmation, 204 après une suppression, 400 pour une requête invalide, 401 sans connexion ou pour un identifiant incorrect, 403 sans le rôle administrateur ou, pour l'espace recruteur, sans entreprise rattachée, 404 pour une ressource inexistante, 409 pour un doublon ou une ligne encore référencée, et 429 après 5 échecs de connexion en 15 minutes pour le même e-mail (l'en-tête `Retry-After` donne l'attente en secondes). Les erreurs ont toujours la forme `{"error": "..."}`. Aucune réponse ne contient de mot de passe ni d'empreinte.

Les commandes et résultats des vérifications sont dans `backend/curl_tests.md` et `backend/tests/curl_auth.md`. Les tests automatiques de la limite de connexion se lancent depuis `backend/` avec `python -m unittest tests.test_login_limit -v`.

## Pages

Navigation sans rechargement de la page (React Router), avec une barre commune : la page active est marquée et le logo ramène à l'accueil. Le menu dépend de la personne : « Offres d'emploi » pour tous, « Connexion » pour un visiteur, « Espace recruteur », « Espace candidat » et « Se déconnecter » une fois connecté, « Administration » pour un administrateur. Sur mobile, il se replie derrière un bouton « Menu ». Le pied de page reprend la navigation et les mentions légales.

| Adresse | Page |
| --- | --- |
| `/` | Accueil : barre de recherche et les deux offres les plus récentes |
| `/offres` | Offres d'emploi : liste des annonces ouvertes, filtrée par la recherche de l'accueil |
| `/login` | Connexion |
| `/account` | Création de compte : la session s'ouvre dès la création, puis l'accueil s'affiche |
| `/verification` | Confirmation de l'adresse, ouverte depuis le lien reçu par e-mail |
| `/espace-candidat` | Espace candidat, onglet « Mes candidatures » |
| `/espace-candidat/informations` | Espace candidat, onglet « Mes informations » : modification du compte, adresse e-mail en lecture seule |
| `/recruteur` | Espace recruteur, onglet « Vue d'ensemble » |
| `/recruteur/entreprise` | Espace recruteur, onglet « Mon entreprise » : fiche de l'entreprise, SIREN en lecture seule |
| `/recruteur/postes` | Espace recruteur, onglet « Mes postes » : annonces de l'entreprise |
| `/recruteur/nouvelle-offre` | Espace recruteur, onglet « Publier une offre » |
| `/admin` | Administration : les cinq tables, avec création, modification, suppression et pagination |
| autre adresse | Page introuvable |

Toutes ces pages lisent et écrivent dans l'API. Les espaces candidat et recruteur demandent d'être connecté : un visiteur y trouve un lien vers la connexion. Sans entreprise rattachée, l'espace recruteur indique que l'administration doit rattacher le compte. L'administration est réservée aux administrateurs : sinon, la page affiche un message sans rien demander à l'API.

Sur chaque annonce, le bouton « En savoir plus » affiche dans la carte toutes les informations de l’annonce, sans fenêtre modale ; un message signale le chargement ou l’échec d’une requête. Le bouton « Postuler » ouvre sous l’annonce le formulaire de candidature, avec ou sans compte. Les textes de l’interface sont en français.

## Évolutions prévues

Le planning sera revu après la soutenance de mi-parcours du 14/10. Ces fonctionnalités ne sont pas encore réalisées ; elles sont classées par ordre de priorité :


**Prioritaire** :


1. E-mails de réception, d’acceptation et de refus d’une candidature, avec leur suivi dans la table des
   candidatures ;
2. Consultation des candidatures reçues par le recruteur, avec acceptation ou refus ;

**À faire** : 


3. Modification, clôture et suppression d’une annonce depuis l’espace recruteur (la clôture existe déjà dans
   l’API) ;
4. Suite du design ;
5. Vérification des parcours et de l’installation sur une machine neuve ;

**Bonus** : 


6. Badge « Nouveau » sur les annonces récentes ;
7. Modification de l’adresse e-mail d’un compte, confirmée par un lien envoyé à la nouvelle adresse ;
8. Dépôt d’un CV avec la candidature et téléchargement par le recruteur ;
9. Protection CSRF des formulaires.

*Le lancement du projet final à partir du build React sera documenté lorsqu’il sera en place.*
