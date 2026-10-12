# Tests de l'API

## Cas 1 : GET /api/ads (attendu 200)

Commande :

```bash
curl -i http://localhost:5000/api/ads
```

Code obtenu : 200

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 19:40:59",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 19:40:59",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python"
  }
]
```

## Cas 2 : GET /api/ads/1 (attendu 200)

Commande :

```bash
curl -i http://localhost:5000/api/ads/1
```

Code obtenu : 200

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": 1,
  "contract_type": "CDI",
  "created_at": "2026-10-07 19:40:59",
  "description": "you will dev many website",
  "id": 1,
  "location": "Paris",
  "salary": 42000,
  "short_description": "Back-end Flask",
  "status": "open",
  "title": "D\u00e9veloppeur Python",
  "working_time": "Temps plein"
}
```

## Cas 3 : GET /api/ads/999 (attendu 404)

Commande :

```bash
curl -i http://localhost:5000/api/ads/999
```

Code obtenu : 404

Réponse :

```json
{ "error": "Ad not found" }
```

## Cas 4 : GET /api/companies/1/ads (attendu 200)

Commande :

```bash
curl -i http://localhost:5000/api/companies/1/ads
```

Code obtenu : 200

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 19:40:59",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 19:40:59",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python"
  }
]
```

## Cas 5 : GET /api/companies/999/ads (attendu 404)

Commande :

```bash
curl -i http://localhost:5000/api/companies/999/ads
```

Code obtenu : 404

Réponse :

```json
{ "error": "Company not found" }
```

## Cas 6 : POST /api/ads complet (attendu 201)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads -H "Content-Type: application/json" -d '{"title": "Test", "short_description": "Court", "company_id": 1, "category_id": 1}'
```

Code obtenu : 201

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": null,
  "contract_type": null,
  "created_at": "2026-10-07 19:41:00",
  "description": null,
  "id": 4,
  "location": null,
  "salary": null,
  "short_description": "Court",
  "status": "open",
  "title": "Test",
  "working_time": null
}
```

## Cas 7 : POST /api/ads sans title (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads -H "Content-Type: application/json" -d '{"short_description": "Court", "company_id": 1, "category_id": 1}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Missing field: title" }
```

## Cas 8 : POST /api/ads avec company_id = 999 (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads -H "Content-Type: application/json" -d '{"title": "Test", "short_description": "Court", "company_id": 999, "category_id": 1}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Unknown company_id or category_id" }
```

## Cas 9 : POST /api/ads/3/applications, personne 3 (attendu 201)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{"person_id": 3, "message": "Bonjour !"}'
```

Code obtenu : 201

Réponse :

```json
{
  "ad_id": 3,
  "created_at": "2026-10-07 19:41:00",
  "id": 5,
  "message": "Bonjour !",
  "person_id": 3,
  "status": "pending"
}
```

## Cas 10 : POST /api/ads/3/applications, même envoi (attendu 409)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{"person_id": 3, "message": "Bonjour !"}'
```

Code obtenu : 409

Réponse :

```json
{ "error": "Already applied" }
```

## Cas 11 : POST /api/ads/1/applications sans message (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads/1/applications -H "Content-Type: application/json" -d '{"person_id": 3}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Missing field: message" }
```

## Cas 12 : POST /api/ads/999/applications (attendu 404)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads/999/applications -H "Content-Type: application/json" -d '{"person_id": 3, "message": "Salut"}'
```

Code obtenu : 404

Réponse :

```json
{ "error": "Ad not found" }
```

# J3 - test de l'API

## Partie 1 : test SQL après avoir tapé --> PRAGMA foreign_keys = ON;

## Test 1

Commande : UPDATE ads SET status = 'invalide' WHERE id = 1;
Résultat : Runtime error: CHECK constraint failed: status IN ('open', 'closed') (19)

## Test 2

Commande : DELETE FROM companies WHERE id = 1;
Résultat : Runtime error: FOREIGN KEY constraint failed (19)

## Test 3

Commande : DELETE FROM ads WHERE id = 1;
Résultat : Runtime error: FOREIGN KEY constraint failed (19)

## Partie 2 : test http (suite J2)

## Test 13 (attendu : 200, "Cybersécurité")

Commande :

```bash
curl -i "http://localhost:5000/api/ads?contract_type=CDI&location=Londres"
```

Code obtenu : 200

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 13:29:32",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
```

## Test 14 (attendu : 200, [])

Commande :

```bash
curl -i http://localhost:5000/api/ads?q=zzzz
```

Code obtenu : 200

Réponse :

```json
[]
```

## Test 15 (attendu : 200, "status": "closed")

Commande :

```bash
curl -i http://localhost:5000/api/ads/2
```

Code obtenu : 200

Réponse :

```json
{
  "category": "Data",
  "company": "GreenWorks",
  "contact_id": 2,
  "contract_type": "Stage",
  "created_at": "2026-10-07 13:29:32",
  "description": "you will analize many arrays",
  "id": 2,
  "location": "Mulhouse",
  "salary": 52000,
  "short_description": "Analyse de donn\u00e9es, SQL",
  "status": "closed",
  "title": "Data analyst",
  "working_time": "35h"
}
```

## Test 16 (attendu : 200, ids 3 et 1 seulement)

Commande :

```bash
curl -i http://localhost:5000/api/ads
```

Code obtenu : 200

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 13:29:32",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-07 13:29:32",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python"
  }
]
```

## Test 17 (attendu : 200, [])

Commande :

```bash
curl -i http://localhost:5000/api/companies/2/ads
```

Code obtenu : 200

Réponse :

```json
[]
```

## Test 19 (attendu : 201)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{"person_id": 1, "message": "Bonjour, je suis intéressé."}'
```

Code obtenu : 201

Réponse :

```json
{
  "ad_id": 3,
  "created_at": "2026-10-07 13:57:02",
  "id": 5,
  "message": "Bonjour, je suis int\u00e9ress\u00e9.",
  "person_id": 1,
  "status": "pending"
}
```

## J4 test

## Partie 1 : test SQL

# Test 1 : inscription d'un nouveau sujet (attendu : 201 CREATED)

Commande :

```bash
curl -i -X POST http://127.0.0.1:5000/api/auth/register -H "Content-Type: application/json" -d '{"first_name":"Bob","last_name":"Test","email":"bob@example.com","password":"password123"}'
```

Code obtenu : 201

Réponse :

```json
{
  "email": "bob@example.com",
  "first_name": "Bob",
  "id": 4,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

# Test 2 : Connexion de cette nouvelle personne (attendu : 200 OK)

Commande :

```bash
curl -i -c cookies.txt -X POST http://127.0.0.1:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"bob@example.com","password":"password123"}'
```

Code obtenu : 200

Réponse :

```json
{
  "email": "bob@example.com",
  "first_name": "Bob",
  "id": 4,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

# Test 3 : Route admin sans connexion (attendu : 401 UNAUTHORIZED)

Commande :

```bash
curl -i http://127.0.0.1:5000/api/admin/people
```

Code obtenu : 401

Réponse :

```json
{
  "error": "Login required"
}
```

# Test 4 : Route admin avec un user non admin (attendu : 403 FORBIDDEN)

Commande :

```bash
curl -i -b cookies.txt http://127.0.0.1:5000/api/admin/people
```

Code obtenu : 403

Réponse :

```json
{
  "error": "Admin only"
}
```

# Test 5 : passer le user en admin (attendu : bob@example.com | admin)

Commande :

```bash
sqlite3 jobboard.db
UPDATE people SET role = 'admin' WHERE email = 'bob@example.com';
```

```vérification
SELECT id, email, role FROM people WHERE email = 'bob@example.com';
```

Obtenu : bob@example.com|admin

Réponse :

```json
4|bob@example.com|admin
```

# Test 6 : reconnection du user en mode admin (attendu : 200 OK)

Commande :

```bash
curl -i -c cookies.txt -X POST http://127.0.0.1:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"bob@example.com","password":"password123"}'
```

Code obtenu :200

Réponse :

```json
{
  "email": "bob@example.com",
  "first_name": "Bob",
  "id": 4,
  "last_name": "Test",
  "phone": null,
  "role": "admin"
}
```

# Test 7 : GET /api/admin/people (attendu 200 OK)

Commande :

```bash
curl -i -b cookies.txt http://127.0.0.1:5000/api/admin/people
```

Code obtenu : 200

Réponse :

```json
[
  {
    "email": "alice.martin@example.com",
    "first_name": "Alice",
    "id": 1,
    "last_name": "Martin",
    "phone": "0600000001",
    "role": "user"
  },
  {
    "email": "bruno.durand@example.com",
    "first_name": "Bruno",
    "id": 2,
    "last_name": "Durand",
    "phone": "0600000002",
    "role": "user"
  },
  {
    "email": "chloe.petit@example.com",
    "first_name": "Chlo\u00e9",
    "id": 3,
    "last_name": "Petit",
    "phone": null,
    "role": "user"
  },
  {
    "email": "bob@example.com",
    "first_name": "Bob",
    "id": 4,
    "last_name": "Test",
    "phone": null,
    "role": "admin"
  }
]
```

# Test 8 : GET /api/admin/companies (attendu 200 OK)

Commande :

```bash
curl -i -b cookies.txt http://127.0.0.1:5000/api/admin/companies
```

Code obtenu : 200

Réponse :

```json
[
  {
    "description": "Studio de d\u00e9veloppement web",
    "id": 1,
    "location": "Paris",
    "name": "TechNova",
    "website": "https://technova.example.com"
  },
  {
    "description": "Agence de design durable",
    "id": 2,
    "location": "Lyon",
    "name": "GreenWorks",
    "website": "https://greenworks.example.com"
  }
]
```

# Test 9 : GET /api/admin/categories (attendu 200 OK)

Commande :

```bash
curl -i -b cookies.txt http://127.0.0.1:5000/api/admin/categories
```

Code obtenu : 200

Réponse :

```json
[
  {
    "id": 1,
    "name": "D\u00e9veloppement"
  },
  {
    "id": 2,
    "name": "Design"
  },
  {
    "id": 3,
    "name": "Data"
  }
]
```

# Test 10 : GET /api/admin/ads (attendu 200 OK)

Commande :

```bash
curl -i -b cookies.txt http://127.0.0.1:5000/api/admin/ads
```

Code obtenu : 200

Réponse :

```json
[
  {
    "category_id": 1,
    "company_id": 1,
    "contact_id": 1,
    "contract_type": "CDI",
    "created_at": "2026-10-08 18:23:28",
    "description": "you will dev many website",
    "id": 1,
    "location": "Paris",
    "salary": 42000,
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python",
    "working_time": "Temps plein"
  },
  {
    "category_id": 3,
    "company_id": 2,
    "contact_id": 2,
    "contract_type": "Stage",
    "created_at": "2026-10-08 18:23:28",
    "description": "you will analize many arrays",
    "id": 2,
    "location": "Mulhouse",
    "salary": 52000,
    "short_description": "Analyse de donn\u00e9es, SQL",
    "status": "closed",
    "title": "Data analyst",
    "working_time": "35h"
  },
  {
    "category_id": 1,
    "company_id": 1,
    "contact_id": 3,
    "contract_type": "CDI",
    "created_at": "2026-10-08 18:23:28",
    "description": "you will defend our website against virus",
    "id": 3,
    "location": "Londres",
    "salary": 100000,
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9",
    "working_time": "Temps plein"
  }
]
```

# Test 11 : GET /api/admin/applications (attendu 200 OK)

Commande :

```bash
curl -i -b cookies.txt http://127.0.0.1:5000/api/admin/applications
```

Code obtenu : 200

Réponse :

```json
[
  {
    "ad_id": 1,
    "created_at": "2025-01-10 09:00:00",
    "id": 1,
    "message": "Bonjour, votre offre correspond \u00e0 mon profil.",
    "person_id": 1,
    "status": "pending"
  },
  {
    "ad_id": 1,
    "created_at": "2025-01-11 14:30:00",
    "id": 2,
    "message": "Bonjour, je souhaite rejoindre votre \u00e9quipe.",
    "person_id": 3,
    "status": "pending"
  },
  {
    "ad_id": 2,
    "created_at": "2025-01-12 18:45:00",
    "id": 3,
    "message": "Bonjour, je candidate \u00e0 cette annonce.",
    "person_id": 2,
    "status": "accepted"
  },
  {
    "ad_id": 2,
    "created_at": "2025-01-13 10:15:00",
    "id": 4,
    "message": "Bonjour, ce poste m'int\u00e9resse beaucoup.",
    "person_id": 3,
    "status": "rejected"
  }
]
```

# Test 12 : POST candidature de l'user (attendu 201 CREATED)

```bash
curl -i -b cookies.txt -X POST http://127.0.0.1:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{"message":"Bonjour"}'
```

Code obtenu : 201

Réponse :

```json
{
  "ad_id": 3,
  "created_at": "2026-10-08 18:54:29",
  "id": 5,
  "message": "Bonjour",
  "person_id": 4,
  "status": "pending"
}
```

# Test 13 : POST candidature de visiteur / pas de cookie dans ce cas (attendu 201 CREATED)

```bash
curl -i -X POST http://127.0.0.1:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{
    "first_name":"Alice",
    "last_name":"Test",
    "email":"alice@example.com",
    "message":"Je suis intéressée."
  }'
```

Code obtenu : 201

Réponse :

```json
{
  "ad_id": 3,
  "created_at": "2026-10-08 18:58:18",
  "id": 6,
  "message": "Je suis int\u00e9ress\u00e9e.",
  "person_id": 5,
  "status": "pending"
}
```

# Test 14 : POST candidature sans message / pas de cookie dans ce cas (attendu 400 BAD REQUEST)

```bash
curl -i -X POST http://127.0.0.1:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{}'
```

Code obtenu : 400

Réponse :

```json
{
  "error": "Missing field: message"
}
```

# Test 15 : POST candidature avec email d'un compte protégé (attendu 401 UNAUTHORIZED)

```bash
curl -i -X POST http://127.0.0.1:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{
    "first_name":"Bob",
    "last_name":"Test",
    "email":"bob@example.com",
    "message":"Bonjour"
  }'
```

Code obtenu : 401

Réponse :

```json
{
  "error": "Login required for this email"
}
```

# Test 16 : fermer l'annonce 3 (attendu : 200 OK)

```bash
curl -i -b cookies.txt -X POST http://127.0.0.1:5000/api/ads/3/closure -H "Content-Type: application/json" -d '{"accepted_application_id":5}'
```

Code obtenu : 200

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": 3,
  "contract_type": "CDI",
  "created_at": "2026-10-08 18:23:28",
  "description": "you will defend our website against virus",
  "id": 3,
  "location": "Londres",
  "salary": 100000,
  "short_description": "Blue team",
  "status": "closed",
  "title": "Cybers\u00e9curit\u00e9",
  "working_time": "Temps plein"
}
```

# Test 17 : postuler à l'annonce fermée (attendu : 409 CONFLICT)

```bash
curl -i -X POST http://127.0.0.1:5000/api/ads/3/applications -H "Content-Type: application/json" -d '{"first_name":"Charlie","last_name":"Test","email":"charlie@example.com","message":"Bonjour"}'
```

Code obtenu : 409

Réponse :

```json
{
  "error": "Ad is closed"
}
```

# Test 18 : essayer de fermer l'annonce déjà fermée (attendu : 409 CONFLICT)

```bash
curl -i -b cookies.txt -X POST http://127.0.0.1:5000/api/ads/3/closure -H "Content-Type: application/json" -d '{"accepted_application_id":1}'
```

Code obtenu : 409

Réponse :

```json
{
  "error": "Ad already closed"
}
```

# Test 19 : Fermer une annonce avec des candidatures sans préciser laquelle accepter (attendu : 400 BAD REQUEST)

```bash
curl -i -b cookies.txt -X POST http://127.0.0.1:5000/api/ads/2/closure -H "Content-Type: application/json" -d '{}'
```

Code obtenu : 400

Réponse :

```json
{
  "error": "Missing field: accepted_application_id"
}
```

# Test 20 : Tester une mauvaise candidature lors de la clôture (attendu : 400 BAD REQUEST)

```bash
curl -i -b cookies.txt -X POST http://127.0.0.1:5000/api/ads/2/closure -H "Content-Type: application/json" -d '{"accepted_application_id":9999}'
```

Code obtenu : 400

Réponse :

```json
{
  "error": "Application does not belong to this ad"
}
```

## J5 Tests

# Partie 1 : droits admin

# Test 1 : Création d'une annonce par un admin (attendu : 201 CREATED)

```bash : inscription du sujet test dans le base de donnée et connexion en admin
curl -i -X POST "http://127.0.0.1:5000/api/auth/register" -H "Content-Type: application/json" -d '{"first_name":"Admin","last_name":"Test","email":"admin@example.com","password":"motdepasse8"}'
sqlite3 jobboard.db "UPDATE people SET role = 'admin' WHERE email = 'admin@example.com';"
sqlite3 jobboard.db "SELECT email, role FROM people;"
curl -i -X POST "http://127.0.0.1:5000/api/auth/login" -H "Content-Type: application/json" -c cookies_admin.txt -d '{"email":"admin@example.com","password":"motdepasse8"}'
```

```bash : création d'une annonce
curl -i -X POST "http://127.0.0.1:5000/api/ads" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"title":"Test","short_description":"Desc","company_id":1,"category_id":1}'
```

Code obtenu : 201 CREATED

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": null,
  "contract_type": null,
  "created_at": "2026-10-09 09:16:38",
  "description": null,
  "id": 4,
  "location": null,
  "salary": null,
  "short_description": "Desc",
  "status": "open",
  "title": "Test",
  "working_time": null
}
```

# Test 2 : Création d'une annonce par un user (attendu : 403 FORBIDDEN)

```bash : inscription du sujet test dans le base de donnée et connexion en user
curl -i -X POST "http://127.0.0.1:5000/api/auth/register" -H "Content-Type: application/json" -d '{"first_name":"Bobby","last_name":"Test","email":"bob2@example.com","password":"motdepasse2"}'
curl -i -X POST "http://127.0.0.1:5000/api/auth/login" -H "Content-Type: application/json" -c cookies_bobby.txt -d '{"email":"bob2@example.com","password":"motdepasse2"}'
```

```bash : création d'une annonce
curl -i -X POST "http://127.0.0.1:5000/api/ads" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"title":"Test","short_description":"Desc","company_id":1,"category_id":1}'
```

Code obtenu : 403 FORBIDDEN

Réponse :

```json
{
  "error": "Admin only"
}
```

# Partie 2 : pagination

# Test 1 : test de la pagination pour 1 annonce par page : page 1 (attendu : 200 OK, 1 annonce, X-Total-Count : 2) ---> X-Total-Count = nombre total d'annonces

```bash
curl -i "http://127.0.0.1:5000/api/ads?page=1&per_page=1"
```

Code obtenu : 200
X-Total-Count : 2

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-09 13:48:43",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
```

# Test 2 : test de la pagination pour 1 annonce par page : page 2 (attendu : 200 OK, 1 annonce, X-Total-Count : 2) ---> X-Total-Count = nombre total d'annonces

```bash
curl -i "http://127.0.0.1:5000/api/ads?page=2&per_page=1"
```

Code obtenu : 200
X-Total-Count : 2

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-09 13:48:43",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python"
  }
]
```

# Test 3 : cas impossible afficher la page 3 alors qu'il n'y a que 2 annonces (attendu : 200 OK, [], X-Total-Count : 2)

```bash
curl -i "http://127.0.0.1:5000/api/ads?page=3&per_page=1"
```

Code obtenu : 200
X-Total-Count : 2

Réponse :

```json
[]
```

# Test 4 : cas impossible, afficher 0 ads par page (attendu : 400, Invalid pagination)

```bash
curl -i "http://127.0.0.1:5000/api/ads?per_page=0"
```

Code obtenu : 400

Réponse :

```json
{
  "error": "Invalid pagination"
}
```

# Test 5 : cas impossible afficher la page "abc" (attendu : 400, Invalid pagination)

```bash
curl -i "http://127.0.0.1:5000/api/ads?page=abc"
```

Code obtenu : 400

Réponse :

```json
{
  "error": "Invalid pagination"
}
```

# Test 5 : affichage de toutes les ads ouvertes : point de vue chercheur d'emploi (attendu : 200 OK, 2 annonces, X-Total-Count : 2)

```bash
curl -i "http://127.0.0.1:5000/api/ads"
```

Code obtenu : 200
X-Total-Count : 2

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-09 13:48:43",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "created_at": "2026-10-09 13:48:43",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python"
  }
]
```

# Test 6 : affichage de toutes les ads ouvertes et fermée : point de vue admin (attendu : 200 OK, 2 annonces, X-Total-Count : 3)

```bash
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/admin/ads?page=1&per_page=2"
```

Code obtenu : 200
X-Total-Count : 3

Réponse :

```json
[
  {
    "category_id": 1,
    "company_id": 1,
    "contact_id": 1,
    "contract_type": "CDI",
    "created_at": "2026-10-09 13:48:43",
    "description": "you will dev many website",
    "id": 1,
    "location": "Paris",
    "salary": 42000,
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python",
    "working_time": "Temps plein"
  },
  {
    "category_id": 3,
    "company_id": 2,
    "contact_id": 2,
    "contract_type": "Stage",
    "created_at": "2026-10-09 13:48:43",
    "description": "you will analize many arrays",
    "id": 2,
    "location": "Mulhouse",
    "salary": 52000,
    "short_description": "Analyse de donn\u00e9es, SQL",
    "status": "closed",
    "title": "Data analyst",
    "working_time": "35h"
  }
]
```

## J6 tests

# Partie 1 : python

# Test 1 : test de remplissage auto de la database (attendu :companies: 12, categories: 6, people: 13, ads: 53, applications: 4)

```bash
python3 init_db.py
python3 seed_data.py
```

Réponse :

```bash
companies: 12
categories: 6
people: 13
ads: 53
applications: 4
```

# Test 2 : test de remplissage auto de la database avec la base déjà pleine (attendu : "Base déjà remplie : 10 entreprise(s) du fichier existe(nt) déjà. Relance python init_db.py avant python seed_data.py.")

```bash
python3 seed_data.py
```

Réponse :

```bash
Base déjà remplie : 10 entreprise(s) du fichier existe(nt) déjà. Relance python init_db.py avant python seed_data.py.
```

# Partie 2 : curl

# Test 1 : affichage des ads (attendu : X-Total-Count: 52, 200 OK, 52 ads)

```bash
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/admin/ads"
```

Code obtenu : 200
X-Total-Count : 52

Réponse :

```json
[
  {
    "company": "Caldrivane",
    "contract_type": "Freelance",
    "created_at": "2026-10-12 10:10:16",
    "id": 53,
    "location": "34000 Montpellier",
    "short_description": "Concevez des d\u00e9marches de proximit\u00e9 \u00e0 partir des situations v\u00e9cues par les habitants.",
    "status": "open",
    "title": "Designer UX ind\u00e9pendant"
  },
  {
    "company": "Caldrivane",
    "contract_type": "Alternance",
    "created_at": "2026-10-12 10:10:16",
    "id": 52,
    "location": "34000 Montpellier",
    "short_description": "Apprenez \u00e0 d\u00e9velopper des modules utiles aux structures qui organisent la vie locale.",
    "status": "open",
    "title": "D\u00e9veloppeur logiciel en alternance"
  },
  {
    "company": "Caldrivane",
    "contract_type": "CDD",
    "created_at": "2026-10-12 10:10:16",
    "id": 51,
    "location": "34000 Montpellier",
    "short_description": "Guidez les utilisateurs \u00e0 distance jusqu'\u00e0 la r\u00e9solution de leur demande.",
    "status": "open",
    "title": "Technicien assistance \u00e0 distance"
  }
]
```

ect jusqu'à la 52ème...

# Test 2 : affichage de 4 ads par page (attendu : X-Total-Count: 52, 200 OK, 4 ads)

```bash
curl -i "http://127.0.0.1:5000/api/ads?per_page=4"
```

Code obtenu : 200
X-Total-Count : 52

Réponse :

```json
[
  {
    "company": "Caldrivane",
    "contract_type": "Freelance",
    "created_at": "2026-10-12 10:10:16",
    "id": 53,
    "location": "34000 Montpellier",
    "short_description": "Concevez des d\u00e9marches de proximit\u00e9 \u00e0 partir des situations v\u00e9cues par les habitants.",
    "status": "open",
    "title": "Designer UX ind\u00e9pendant"
  },
  {
    "company": "Caldrivane",
    "contract_type": "Alternance",
    "created_at": "2026-10-12 10:10:16",
    "id": 52,
    "location": "34000 Montpellier",
    "short_description": "Apprenez \u00e0 d\u00e9velopper des modules utiles aux structures qui organisent la vie locale.",
    "status": "open",
    "title": "D\u00e9veloppeur logiciel en alternance"
  },
  {
    "company": "Caldrivane",
    "contract_type": "CDD",
    "created_at": "2026-10-12 10:10:16",
    "id": 51,
    "location": "34000 Montpellier",
    "short_description": "Guidez les utilisateurs \u00e0 distance jusqu'\u00e0 la r\u00e9solution de leur demande.",
    "status": "open",
    "title": "Technicien assistance \u00e0 distance"
  },
  {
    "company": "Caldrivane",
    "contract_type": "CDI",
    "created_at": "2026-10-12 10:10:16",
    "id": 50,
    "location": "34000 Montpellier",
    "short_description": "Organisez des changements num\u00e9riques que les petites structures peuvent absorber.",
    "status": "open",
    "title": "Chef de projet transformation num\u00e9rique"
  }
]
```

# Test 3 : essayer de voir ses candidatures dans son compte sans se connecter (attendu : Login required, 401)

```bash
curl -i "http://127.0.0.1:5000/api/me/applications"
```

Code obtenu : 401

Réponse :

```json
{
  "error": "Login required"
}
```

# Test 4 : compte connecté sans candidature (attendu : [], 200)

```bash
curl -i -b cookies_bob.txt "http://127.0.0.1:5000/api/me/applications"
```

Code obtenu : 200

Réponse :

```json
[]
```

# Test 5 : postuler à une offre et la voir dans son espace (attendu : une offre avec 7 champs, 200)

```bash
## postuler à une candidature
curl -s -X POST "http://127.0.0.1:5000/api/ads/3/applications" -H "Content-Type: application/json" -b cookies_bob.txt -d '{"message":"Candidature de Bob"}'

## profil de bob espace "mes candidatures"
curl -i -b cookies_bob.txt "http://127.0.0.1:5000/api/me/applications"
```

Réponse du POST :
Code obtenu : 201

````json
{
  "ad_id": 3,
  "created_at": "2026-10-12 12:11:24",
  "id": 5,
  "message": "Candidature de Bob",
  "person_id": 4,
  "status": "pending"
}

Réponse du GET :
Code obtenu : 201

```json
[
  {
    "ad_id": 3,
    "company": "TechNova",
    "created_at": "2026-10-12 12:11:24",
    "id": 5,
    "message": "Candidature de Bob",
    "status": "pending",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
````

# Test 6 : essayé de repostuler à une candidature (attendu : already applied, 409 conflict)

```bash
## postuler à une candidature
curl -s -X POST "http://127.0.0.1:5000/api/ads/3/applications" -H "Content-Type: application/json" -b cookies_bob.txt -d '{"message":"Candidature de Bob"}'
```

Code obtenu : 409

Réponse :

```json
{
  "error": "Already applied"
}
```

# Test 7 : vision de l'espace mes candidature alors que plusieures personnes ont postulé à la même (attendu : une offre avec 7 champs pour chacun, 200)

```bash
## postuler à une candidature
curl -s -X POST "http://127.0.0.1:5000/api/ads/3/applications" -H "Content-Type: application/json" -b cookies_carla.txt -d '{"message":"Candidature de Carla"}'


## profil de bob et carla espace "mes candidatures"
curl -i -b cookies_carla.txt "http://127.0.0.1:5000/api/me/applications"
curl -i -b cookies_bob.txt "http://127.0.0.1:5000/api/me/applications"
```

Code obtenu : 200

Réponse :

```json
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.14.4
Date: Mon, 12 Oct 2026 12:16:05 GMT
Content-Type: application/json
Content-Length: 212
Vary: Cookie
Connection: close

[
  {
    "ad_id": 3,
    "company": "TechNova",
    "created_at": "2026-10-12 12:16:04",
    "id": 6,
    "message": "Candidature de Carla",
    "status": "pending",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.14.4
Date: Mon, 12 Oct 2026 12:16:05 GMT
Content-Type: application/json
Content-Length: 210
Vary: Cookie
Connection: close

[
  {
    "ad_id": 3,
    "company": "TechNova",
    "created_at": "2026-10-12 12:11:24",
    "id": 5,
    "message": "Candidature de Bob",
    "status": "pending",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
```

# Test 8 : vision de l'espace mes candidature de bob et carla alors que bob est retenu (attendu : bob = accepted, carla = rejected, une offre avec 7 champs pour chacun, 200)

```bash
## accepter bob
curl -s -X POST "http://127.0.0.1:5000/api/ads/3/closure" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"accepted_application_id": 5}'

## profil de bob et carla espace "mes candidatures"
curl -i -b cookies_bob.txt "http://127.0.0.1:5000/api/me/applications"
curl -i -b cookies_carla.txt "http://127.0.0.1:5000/api/me/applications"
```

Code obtenu : 200

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": 3,
  "contract_type": "CDI",
  "created_at": "2026-10-12 12:05:35",
  "description": "you will defend our website against virus",
  "id": 3,
  "location": "Londres",
  "salary": 100000,
  "short_description": "Blue team",
  "status": "closed",
  "title": "Cybers\u00e9curit\u00e9",
  "working_time": "Temps plein"
}
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.14.4
Date: Mon, 12 Oct 2026 12:28:02 GMT
Content-Type: application/json
Content-Length: 211
Vary: Cookie
Connection: close

[
  {
    "ad_id": 3,
    "company": "TechNova",
    "created_at": "2026-10-12 12:11:24",
    "id": 5,
    "message": "Candidature de Bob",
    "status": "accepted",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.14.4
Date: Mon, 12 Oct 2026 12:28:02 GMT
Content-Type: application/json
Content-Length: 213
Vary: Cookie
Connection: close

[
  {
    "ad_id": 3,
    "company": "TechNova",
    "created_at": "2026-10-12 12:16:04",
    "id": 6,
    "message": "Candidature de Carla",
    "status": "rejected",
    "title": "Cybers\u00e9curit\u00e9"
  }
]
```
