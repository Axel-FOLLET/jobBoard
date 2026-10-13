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

# Partie 3 : SIREN des entreprises

# Test 1 : lecture d'une fiche avec son SIREN (attendu : 200, siren présent)

```bash
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/admin/companies/1"
```

Code obtenu : 200

```json
{
  "description": "Studio de développement web",
  "id": 1,
  "location": "Paris",
  "name": "TechNova",
  "siren": "000000991",
  "website": "https://technova.example.com"
}
```

# Test 2 : création correcte, espaces retirés (attendu : 201, siren "123456789")

```bash
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"Test SA","siren":" 123456789 "}'
```

Code obtenu : 201

```json
{
  "description": null,
  "id": 13,
  "location": null,
  "name": "Test SA",
  "siren": "123456789",
  "website": null
}
```

# Test 3 : SIREN absent, vide, espaces ou null (attendu : 400, Missing field: siren)

```bash
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X"}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":""}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":"   "}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":null}'
```

Code obtenu : 400 (les 4 cas)

```json
{ "error": "Missing field: siren" }
```

# Test 4 : format refusé (attendu : 400, Invalid value)

```bash
## nombre JSON (pas une chaîne)
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":123456780}'
## lettres
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":"12345678A"}'
## 8 chiffres
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":"12345678"}'
## 10 chiffres
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"X","siren":"1234567890"}'
```

Code obtenu : 400 (les 4 cas)

```json
{ "error": "Invalid value" }
```

# Test 5 : SIREN commençant par zéro (attendu : 201, le zéro est conservé)

```bash
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"Zero SA","siren":"012345678"}'
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/admin/companies/14"
sqlite3 jobboard.db "SELECT quote(siren), typeof(siren) FROM companies WHERE id = 14;"
```

Code obtenu : 201 puis 200

```json
{
  "description": null,
  "id": 14,
  "location": null,
  "name": "Zero SA",
  "siren": "012345678",
  "website": null
}
```

En base : `'012345678'|text`

# Test 6 : deux créations avec le même SIREN (attendu : 409, Already exists, pas de nouvelle fiche)

```bash
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"Zero SA","siren":"012345678"}'
sqlite3 jobboard.db "SELECT quote(siren), typeof(siren) FROM companies WHERE name = 'Zero SA';"
```

Code obtenu : 409

```json
{ "error": "Already exists" }
```

Nombre de fiches avant / après : 14 / 14.

# Test 7 : modification vers le SIREN d'une autre entreprise (attendu : 409, fiche inchangée)

```bash
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/companies/13" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"Renommé","siren":"012345678"}'
sqlite3 jobboard.db "SELECT name, siren FROM companies WHERE id = 13;"
```

Code obtenu : 409

```json
{ "error": "Already exists" }
```

Fiche inchangée : `Test SA|123456789` (le nom n'a pas été modifié non plus).

# Test 10 : modification qui garde son propre SIREN (attendu : 200)

```bash
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/companies/13" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"siren":"123456789","location":"Paris"}'
```

Code obtenu : 200

```json
{
  "description": null,
  "id": 13,
  "location": "Paris",
  "name": "Test SA",
  "siren": "123456789",
  "website": null
}
```

# Test 11 : modification sans siren, puis tentative d'effacement (attendu : 200 SIREN conservé, puis 400)

```bash
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/companies/13" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"website":"https://test.example.com"}'
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/companies/13" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"siren":null}'
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/companies/13" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"siren":""}'
```

Code obtenu : 200, puis 400 et 400

```json
{"description":null,"id":13,"location":"Paris","name":"Test SA","siren":"123456789","website":"https://test.example.com"}
{"error":"Missing field: siren"}
{"error":"Missing field: siren"}
```

# Test 12 : ancienne fiche sans SIREN, lisible puis complétée (attendu : 200 avec null, puis 200 avec le SIREN)

```bash
sqlite3 jobboard.db "INSERT INTO companies (name) VALUES ('Ancienne');"
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/admin/companies/15"
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/companies/15" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"siren":"555555555"}'
```

Code obtenu : 200 puis 200

```json
{"description":null,"id":15,"location":null,"name":"Ancienne","siren":null,"website":null}
{"description":null,"id":15,"location":null,"name":"Ancienne","siren":"555555555","website":null}
```

# Test 13 : protections et autres tables inchangées (attendu : 401, 403, 201, 400)

```bash
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -d '{"name":"X","siren":"111111111"}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/companies" -H "Content-Type: application/json" -b cookies_bob.txt -d '{"name":"X","siren":"111111111"}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/categories" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"Nouvelle"}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/categories" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"name":"N2","siren":"111111111"}'
```

Code obtenu : 401, 403, 201, 400

```json
{"error":"Login required"}
{"error":"Admin only"}
{"id":7,"name":"Nouvelle"}
{"error":"Unknown field: siren"}
```

## Test J7

# Test 1 : La colonne existe (attendu: company_id|INTEGER|0|NULL)

```bash
sqlite3 jobboard.db "SELECT name, type, \"notnull\", quote(dflt_value) FROM pragma_table_info('people') WHERE name = 'company_id';"
```

Code obtenu : 401, 403, 201, 400

```json
company_id|INTEGER|0|NULL
```

# Test 2 : L'admin voit le champ (attendu: 200, "company_id": null)

```bash
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/admin/people/15"
```

Code obtenu : 200

```json
{
  "company_id": null,
  "email": "bob@example.com",
  "first_name": "Bob",
  "id": 15,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

# Test 3 : Entreprise inconnue (attendu: 400 Unknown reference, pour les 2)

```bash
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/people/15" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"company_id":999}'
curl -i -X POST "http://127.0.0.1:5000/api/admin/people" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"first_name":"Rec","last_name":"Test","email":"rec@example.com","company_id":999}'
```

Code obtenu : 400 (pour les 2)

```json (pour les 2)
{
  "error": "Unknown reference"
}
```

# Test 4 : L'admin rattache Bob à une entreprise (attendu: 200, "company_id": 1)

```bash
curl -i -X PATCH "http://127.0.0.1:5000/api/admin/people/15" -H "Content-Type: application/json" -b cookies_admin.txt -d '{"company_id":1}'
```

Code obtenu : 200

```json
{
  "company_id": 1,
  "email": "bob@example.com",
  "first_name": "Bob",
  "id": 15,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

# Test 5 : Bob ne peut pas se l'attribuer lui-même (attendu: 400 Unknown field: company_id)

```bash
curl -i -X PATCH "http://127.0.0.1:5000/api/auth/me" -H "Content-Type: application/json" -b cookies_bob.txt -d '{"company_id":2}'
```

Code obtenu : 400

```json
{
  "error": "Unknown field: company_id"
}
```

# Test 6 : Connexion d'un user qui essait de se faire passer pour un recruteur (attendu: 201, puis NULL en base, la personne s'inscrit mais n'est pas recruteuse, le code recruteur est ignoré)

```bash
curl -i -X POST "http://127.0.0.1:5000/api/auth/register" -H "Content-Type: application/json" -d '{"first_name":"Eve","last_name":"Test","email":"eve@example.com","password":"motdepasse8","company_id":1}'
sqlite3 jobboard.db "SELECT email, quote(company_id) FROM people WHERE email = 'eve@example.com';"
```

Code obtenu : 201 puis NULL

```json register
{
  "email": "eve@example.com",
  "first_name": "Eve",
  "id": 16,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

```json le code
eve@example.com|NULL
```

# Test 6 : GET /api/categories, publique (attendu: 200, 6 catégories par ordre alphabétique)

```bash
curl -i "http://127.0.0.1:5000/api/categories"

```

Code obtenu : 200

```json
[
  {
    "id": 4,
    "name": "Cybers\u00e9curit\u00e9"
  },
  {
    "id": 3,
    "name": "Data"
  },
  {
    "id": 2,
    "name": "Design"
  },
  {
    "id": 1,
    "name": "D\u00e9veloppement"
  },
  {
    "id": 5,
    "name": "Gestion de projet"
  },
  {
    "id": 6,
    "name": "Support informatique"
  }
]
```

# Test 7 : Les refus (le décorateur recruteur_required)

```bash
# sans session -> attendu : 401 Login required
curl -i "http://127.0.0.1:5000/api/recruiter/company"
curl -i "http://127.0.0.1:5000/api/recruiter/ads"

# utilisateur ordinaire -> attendu : 403 Recruiter only
curl -i -b cookies_bob.txt "http://127.0.0.1:5000/api/recruiter/company"
curl -i -b cookies_bob.txt "http://127.0.0.1:5000/api/recruiter/ads"

# admin sans entreprise -> attendu : 403 Recruiter only
curl -i -b cookies_admin.txt "http://127.0.0.1:5000/api/recruiter/company"
```

Code obtenu : 401 (pour les 2)

```json sans sessions (pour les 2)
{
  "error": "Login required"
}
```

Code obtenu : 403 (pour les 2)

```json utilisateur ordinaire (pour les 2)
{
  "error": "Recruiter only"
}
```

Code obtenu : 403

```json admin sans entreprise
{
  "error": "Recruiter only"
}
```

# Test 8 : GET /api/recruiter/company (attendu: 200, TechNova pour Rec1, avec son siren)

```bash
curl -i -b cookies_rec1.txt "http://127.0.0.1:5000/api/recruiter/company"

```

Code obtenu : 200

```json
{
  "description": "Studio de d\u00e9veloppement web",
  "id": 1,
  "location": "Paris",
  "name": "TechNova",
  "siren": "000000991",
  "website": "https://technova.example.com"
}
```

# Test 9 : PATCH /api/recruiter/company

```bash
# corps vide -> attendu : 400 No fields to update
curl -i -X PATCH "http://127.0.0.1:5000/api/recruiter/company" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{}'

# siren -> attendu : 400 Unknown field: siren
curl -i -X PATCH "http://127.0.0.1:5000/api/recruiter/company" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"siren":"111111111"}'

# id -> attendu : 400 Unknown field: id
curl -i -X PATCH "http://127.0.0.1:5000/api/recruiter/company" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"id":5}'

# name vide -> attendu : 400 Missing field: name
curl -i -X PATCH "http://127.0.0.1:5000/api/recruiter/company" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"name":"   "}'

# correct -> attendu : 200, name "TechNova SA" (espaces retirés) et location modifiée
curl -i -X PATCH "http://127.0.0.1:5000/api/recruiter/company" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"name":" TechNova SA ","location":"Paris 9e"}'

# l'autre entreprise n'a pas bougé -> attendu : GreenWorks|Lyon
sqlite3 jobboard.db "SELECT name, location FROM companies WHERE id = 2;"
```

Code obtenu corps vide : 400

```json
{
  "error": "No fields to update"
}
```

Code obtenu siren vide : 400

```json
{
  "error": "Unknown field: siren"
}
```

Code obtenu id vide : 400

```json
{
  "error": "Unknown field: id"
}
```

Code obtenu name vide : 400

```json
{
  "error": "Missing field: name"
}
```

Code obtenu cas correct : 200

```json
{
  "description": "Studio de d\u00e9veloppement web",
  "id": 1,
  "location": "Paris 9e",
  "name": "TechNova SA",
  "siren": "000000991",
  "website": "https://technova.example.com"
}
```

Obtenu l'entreprise n'a pas bougé

```json
GreenWorks|Lyon
```

# Test 10 : GET /api/recruiter/ads: chacun ne voit que les siennes

```bash
#Rec1 (TechNova): les annonces 3 (applications_count: 0, oldest_unanswered_at: null) et 1 (applications_count: 2, oldest_unanswered_at: "2025-01-10 09:00:00").
curl -i -b cookies_rec1.txt "http://127.0.0.1:5000/api/recruiter/ads"

#Rec2 (GreenWorks): l'annonce 2, fermée (applications_count: 2, oldest_unanswered_at: null, car ses candidatures sont accepted et rejected, aucune pending).
curl -i -b cookies_rec2.txt "http://127.0.0.1:5000/api/recruiter/ads"

```

Code obtenu cas correct : 200 pour les 2

```json Rec1
[
  {
    "applications_count": 0,
    "contract_type": "CDI",
    "created_at": "2026-10-13 13:27:46",
    "id": 3,
    "location": "Londres",
    "oldest_unanswered_at": null,
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "applications_count": 2,
    "contract_type": "CDI",
    "created_at": "2026-10-13 13:27:46",
    "id": 1,
    "location": "Paris",
    "oldest_unanswered_at": "2025-01-10 09:00:00",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "D\u00e9veloppeur Python"
  }
]
```

```json Rec2
[
  {
    "applications_count": 2,
    "contract_type": "Stage",
    "created_at": "2026-10-13 13:27:46",
    "id": 2,
    "location": "Mulhouse",
    "oldest_unanswered_at": null,
    "short_description": "Analyse de donn\u00e9es, SQL",
    "status": "closed",
    "title": "Data analyst"
  }
]
```

# Test 11 : POST /api/recruiter/ads (attendu : 400 pour company_id, contact_id, title absent et catégorie inconnue ; 201 pour une annonce correcte, qui porte l'entreprise du recruteur)

```bash
# company_id envoyé -> attendu : 400 Unknown field: company_id
curl -i -X POST "http://127.0.0.1:5000/api/recruiter/ads" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"title":"T","short_description":"S","category_id":1,"company_id":2}'

# contact_id envoyé -> attendu : 400 Unknown field: contact_id
curl -i -X POST "http://127.0.0.1:5000/api/recruiter/ads" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"title":"T","short_description":"S","category_id":1,"contact_id":2}'

# title absent -> attendu : 400 Missing field: title
curl -i -X POST "http://127.0.0.1:5000/api/recruiter/ads" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"short_description":"S","category_id":1}'

# catégorie inconnue -> attendu : 400 Unknown category_id
curl -i -X POST "http://127.0.0.1:5000/api/recruiter/ads" -H "Content-Type: application/json" -b cookies_rec1.txt -d '{"title":"T","short_description":"S","category_id":999}'

# correct -> attendu : 201, "company": "GreenWorks", "category": "Design", contact_id = id de Rec2
curl -i -X POST "http://127.0.0.1:5000/api/recruiter/ads" -H "Content-Type: application/json" -b cookies_rec2.txt -d '{"title":"Designer","short_description":"UX","category_id":2,"salary":40000,"contract_type":"CDI"}'

# vérification en base : entreprise 2, contact = Rec2, statut open
sqlite3 jobboard.db "SELECT company_id, contact_id, status FROM ads ORDER BY id DESC LIMIT 1;"
sqlite3 jobboard.db "SELECT id FROM people WHERE email = 'rec2@example.com';"

# l'annonce apparaît dans la liste de Rec2, pas dans celle de Rec1
curl -s -b cookies_rec2.txt "http://127.0.0.1:5000/api/recruiter/ads"
curl -s -b cookies_rec1.txt "http://127.0.0.1:5000/api/recruiter/ads"
```

Code obtenu company_id envoyé : 400

```json
{
  "error": "Unknown field: company_id"
}
```

Code obtenu contact_id envoyé : 400

```json
{
  "error": "Unknown field: contact_id"
}
```

Code obtenu title absent : 400

```json
{
  "error": "Missing field: title"
}
```

Code obtenu catégorie inconnue : 400

```json
{
  "error": "Unknown category_id"
}
```

Code obtenu cas correct : 201

```json
{
  "category": "Design",
  "company": "GreenWorks",
  "contact_id": 17,
  "contract_type": "CDI",
  "created_at": "2026-10-13 13:52:58",
  "description": null,
  "id": 54,
  "location": null,
  "salary": 40000,
  "short_description": "UX",
  "status": "open",
  "title": "Designer",
  "working_time": null
}
```

Obtenu en base : l'annonce porte l'entreprise de Rec2 (2), Rec2 comme contact (17) et le statut open

```json
2|17|open
17
```

Code obtenu liste de Rec2 : 200, la nouvelle annonce apparaît en premier

```json Rec2
[
  {
    "applications_count": 0,
    "contract_type": "CDI",
    "created_at": "2026-10-13 13:52:58",
    "id": 54,
    "location": null,
    "oldest_unanswered_at": null,
    "short_description": "UX",
    "status": "open",
    "title": "Designer"
  },
  {
    "applications_count": 2,
    "contract_type": "Stage",
    "created_at": "2026-10-13 13:27:46",
    "id": 2,
    "location": "Mulhouse",
    "oldest_unanswered_at": null,
    "short_description": "Analyse de données, SQL",
    "status": "closed",
    "title": "Data analyst"
  }
]
```

Code obtenu liste de Rec1 : 200, la nouvelle annonce n'y est pas (identique au test 10)

```json Rec1
[
  {
    "applications_count": 0,
    "contract_type": "CDI",
    "created_at": "2026-10-13 13:27:46",
    "id": 3,
    "location": "Londres",
    "oldest_unanswered_at": null,
    "short_description": "Blue team",
    "status": "open",
    "title": "Cybersécurité"
  },
  {
    "applications_count": 2,
    "contract_type": "CDI",
    "created_at": "2026-10-13 13:27:46",
    "id": 1,
    "location": "Paris",
    "oldest_unanswered_at": "2025-01-10 09:00:00",
    "short_description": "Back-end Flask",
    "status": "open",
    "title": "Développeur Python"
  }
]
```

# Test 12 : seed_data.py rattache les 10 contacts du fichier à l'entreprise de leurs annonces (attendu : 10, puis chaque contact avec son entreprise)

```bash
# base neuve et remplissage
python3 init_db.py
python3 seed_data.py

# nombre de recruteurs -> attendu : 10
sqlite3 jobboard.db "SELECT COUNT(*) FROM people WHERE company_id IS NOT NULL;"

# qui est rattaché à quelle entreprise -> attendu : les 10 contacts, chacun avec l'entreprise de ses annonces
sqlite3 -header -column jobboard.db "SELECT people.email, companies.name AS entreprise FROM people JOIN companies ON companies.id = people.company_id;"
```

Obtenu nombre de recruteurs : 10

```bash
10
```

Obtenu rattachement : chaque contact est rattaché à l'entreprise de ses annonces (Alice, Bruno et Chloé de seed.sql restent sans entreprise)

```bash
email                          entreprise
-----------------------------  ----------
elodie.varenot@example.com     Orvelune
mathis.clervaux@example.com    Talvoria
ines.delrival@example.com      Nerquilio
hugo.montelac@example.com      Velsorine
anais.brivel@example.com       Praxeline
leo.savenot@example.com        Dorlavie
manon.rivorel@example.com      Mirelquaz
noemie.valcen@example.com      Solvenyre
jules.dorlier@example.com      Brumelix
camille.lesterval@example.com  Caldrivane
```
