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
