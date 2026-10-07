# Y.I.A Jobs — Job Board

> Brouillon à jour du 07/10/2026, fin du J3.
> Axel l'adapte puis le copie dans `EPITECH/projets/jobBoard/README.md`.
> Exigence du sujet (jobBoard-project.pdf, Delivery) : expliquer comment installer, configurer et lancer le projet,
> et décrire ses composants principaux (schéma de la base, routes de l'API, pages).

Y.I.A Jobs (initiales de Yohan, Ismail et Axel) est une plateforme d’annonces d’emploi développée avec React, Flask et SQLite.
Projet Epitech réalisé à trois : Axel FOLLET (chef de projet, front-end), Yohan AVRONSART (back-end : données et métier) et Ismail BASSIT (back-end : comptes et sécurité).

## Technologies

| Partie | Outils |
| --- | --- |
| Base de données | SQLite (fichier `backend/jobboard.db`) |
| Back-end / API | Python, Flask |
| Front-end | React 19, React Router 8, Vite 8, ESLint |

## Structure du dépôt
```
JobBoard/
├── backend/                API Flask et base de données
│   ├── app.py              crée l'application et enregistre les blueprints (port 5000)
│   ├── db.py               ouverture de la base (clés étrangères activées)
│   ├── routes/
│   │   ├── ads.py          annonces, entreprises, candidatures
│   │   └── auth.py         inscription et connexion
│   ├── schema.sql          création des tables
│   ├── seed.sql            données de test
│   ├── init_db.py          crée jobboard.db à partir de schema.sql et seed.sql
│   ├── queries.sql         requêtes d'exemple
│   ├── checks.sql          insertions qui doivent échouer (tests des contraintes)
│   ├── curl_tests.md       tests de l'API (commandes, codes, réponses)
│   ├── tests/curl_auth.md  tests de l'inscription et de la connexion
│   └── requirements.txt
├── docs/
│   └── contrat_api.md      contrat de l'API : routes, champs, codes, messages d'erreur
└── frontend/               interface React (Vite)
    ├── index.html
    ├── vite.config.js      proxy des appels /api vers l'API Flask
    └── src/
        ├── App.jsx         routes de l'interface
        ├── components/     Layout (barre de navigation), carte d'annonce
        └── pages/          une page par adresse
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
python init_db.py               # crée jobboard.db et affiche le nombre de lignes par table
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

Les sessions, la clé secrète et le compte administrateur de test ne sont pas encore implémentés. Leur configuration sera documentée après réalisation.

## Base de données

| Table | Rôle | Colonnes principales |
| --- | --- | --- |
| `companies` | entreprises | id, name, description, location, website |
| `categories` | catégories d'annonces | id, name (unique) |
| `people` | candidats et responsables d'annonces | id, first_name, last_name, email (unique), phone, password_hash, role (`user` / `admin`) |
| `ads` | annonces | id, title, short_description, description, salary, location, working_time, contract_type, status (`open` / `closed`), created_at, company_id, category_id, contact_id |
| `applications` | candidatures | id, ad_id, person_id, message, status (`pending` / `accepted` / `rejected`), created_at |

Relations :
- une entreprise publie plusieurs annonces (`ads.company_id`) ;
- une annonce appartient à une seule catégorie (`ads.category_id`) et a un responsable (`ads.contact_id`) ;
- une personne peut postuler à plusieurs annonces et une annonce recevoir plusieurs candidatures (table `applications`) ;
- une personne ne peut pas postuler deux fois à la même annonce (`UNIQUE (ad_id, person_id)`).

Toutes les clés étrangères sont en `ON DELETE RESTRICT` : la base refuse de supprimer une entreprise, une catégorie ou une personne encore référencée, ni une annonce qui a des candidatures. Les statuts et le rôle sont limités à leurs valeurs par des contraintes `CHECK`.

## Routes de l'API
Toutes les routes sont sous `/api` et répondent en JSON. Le détail des champs, des codes et des messages est dans [`docs/contrat_api.md`](docs/contrat_api.md).

| Méthode | Route | Fonction |
| --- | --- | --- |
| GET | `/api/ads` | Lister les annonces ouvertes, avec filtres facultatifs |
| GET | `/api/ads/<id>` | Obtenir le détail d’une annonce (même fermée) |
| GET | `/api/companies/<id>/ads` | Lister les annonces ouvertes d’une entreprise |
| POST | `/api/ads` | Créer une annonce |
| POST | `/api/ads/<id>/applications` | Enregistrer une candidature |
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Vérifier un email et un mot de passe |

Filtres de `GET /api/ads`, tous facultatifs et combinables : `q` (texte dans le titre ou la description courte), `category`, `contract_type` et `location` (valeurs exactes). Les annonces fermées n’apparaissent jamais dans les listes.

Les routes renvoient 200 en lecture, 201 à la création, 400 pour une requête invalide, 401 pour un identifiant de connexion incorrect, 404 pour une ressource inexistante et 409 pour un doublon. Les mots de passe sont enregistrés hachés ; aucune réponse ne contient le mot de passe ni son empreinte. Les commandes et résultats des vérifications sont dans `backend/curl_tests.md` et `backend/tests/curl_auth.md`.

La protection des opérations de gestion (sessions, droits d’administration) est planifiée. La connexion ne renvoie pour l’instant que les informations du compte.

## Pages
Navigation sans rechargement de la page (React Router), avec une barre commune : la page active est marquée.

| Adresse | Page |
| --- | --- |
| `/` | Job Board : liste des annonces ouvertes |
| `/login` | Connexion (page provisoire) |
| `/account` | Compte (page provisoire) |
| `/admin` | Administration (page provisoire) |
| autre adresse | Page introuvable |

Sur chaque annonce, le bouton « En savoir plus » affiche dans la carte toutes les informations de l’annonce, sans fenêtre modale ; un message signale le chargement ou l’échec d’une requête. Le bouton « Postuler » est présent ; son formulaire est prévu au J4. Les textes de l’interface sont en français.

## Évolutions prévues

Ces fonctionnalités sont planifiées ; elles ne sont pas encore présentées comme réalisées :

- J4 : formulaire de candidature, candidature sans compte, clôture d’une annonce, CRUD de l’API réservé à l’administrateur, sessions, modification du compte, premier administrateur de test.
- J5 : pagination, pages de connexion et de compte, Mes candidatures, protection CSRF, script de remplissage de la base (environ 50 annonces).
- J6 : interface d’administration de toutes les tables, tests automatiques (pytest), recherche dans l’interface.
- J7 : emails de réception, d’acceptation et de refus, finition du design.
- J8 : vérification des parcours et de l’installation sur une machine neuve.
- Bonus, seulement si le temps le permet : espace recruteur (mon entreprise, mes annonces, publier).

Le lancement du projet final à partir du build React sera documenté lorsqu’il sera en place.

## Auteurs

- Axel FOLLET
- Yohan AVRONSART
- Ismail BASSIT
