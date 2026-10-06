# Tests de l'API

## Cas 1 : GET /ads (attendu 200)

Commande :

```bash
curl -i http://localhost:5000/ads
```

Code obtenu : 200

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "company": "GreenWorks",
    "contract_type": "Stage",
    "id": 2,
    "location": "Mulhouse",
    "short_description": "Analyse de donn\u00e9es, SQL",
    "title": "Data analyst"
  },
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "title": "D\u00e9veloppeur Python"
  }
]
```

## Cas 2 : GET /ads/1 (attendu 200)

Commande :

```bash
curl -i http://localhost:5000/ads/1
```

Code obtenu : 200

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": 1,
  "contract_type": "CDI",
  "created_at": "2026-10-06 13:48:44",
  "description": "you will have to make website",
  "id": 1,
  "location": "Paris",
  "salary": 42000,
  "short_description": "Back-end Flask",
  "title": "D\u00e9veloppeur Python",
  "working_time": "Temps plein"
}
```

## Cas 3 : GET /ads/999 (attendu 404)

Commande :

```bash
curl -i http://localhost:5000/ads/999
```

Code obtenu : 404

Réponse :

```json
{ "error": "Ad not found" }
```

## Cas 4 : GET companies/1/ads (attendu 200)

Commande :

```bash
curl -i http://localhost:5000/companies/1/ads
```

Code obtenu : 200

Réponse :

```json
[
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "id": 3,
    "location": "Londres",
    "short_description": "Blue team",
    "title": "Cybers\u00e9curit\u00e9"
  },
  {
    "company": "TechNova",
    "contract_type": "CDI",
    "id": 1,
    "location": "Paris",
    "short_description": "Back-end Flask",
    "title": "D\u00e9veloppeur Python"
  }
]
```

## Cas 5 : GET companies/999/ads (attendu 404)

Commande :

```bash
curl -i http://localhost:5000/companies/999/ads
```

Code obtenu : 404

Réponse :

```json
{ "error": "Company not found" }
```

## Cas 6 : POST /ads complet (attendu 201)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads -H "Content-Type: application/json" -d '{"title": "Test", "short_description": "Court", "company_id": 1, "category_id": 1}'
```

Code obtenu : 201

Réponse :

```json
{
  "category": "D\u00e9veloppement",
  "company": "TechNova",
  "contact_id": null,
  "contract_type": null,
  "created_at": "2026-10-06 14:07:15",
  "description": null,
  "id": 4,
  "location": null,
  "salary": null,
  "short_description": "Court",
  "title": "Test",
  "working_time": null
}
```

## Cas 7 : POST /ads sans title (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads -H "Content-Type: application/json" -d '{"short_description": "Court", "company_id": 1, "category_id": 1}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Missing field: title" }
```

## Cas 8 : POST /ads avec company_id = 999 (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads -H "Content-Type: application/json" -d '{"title": "Test", "short_description": "Court", "company_id": 999, "category_id": 1}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Unknown company_id or category_id" }
```

## Cas 9 : POST /ads/2/applications, personne 3 (attendu 201)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads/2/applications -H "Content-Type: application/json" -d '{"person_id": 3, "message": "Bonjour !"}'
```

Code obtenu : 201

Réponse :

```json
{
  "ad_id": 2,
  "created_at": "2026-10-06 14:13:01",
  "id": 5,
  "message": "Bonjour !",
  "person_id": 3
}
```

## Cas 10 : POST /ads/2/applications, même envoi (attendu 409)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads/2/applications -H "Content-Type: application/json" -d '{"person_id": 3, "message": "Bonjour !"}'
```

Code obtenu : 409

Réponse :

```json
{ "error": "Already applied" }
```

## Cas 11 : POST /ads/1/applications sans message (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads/1/applications -H "Content-Type: application/json" -d '{"person_id": 3}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Missing field: message" }
```

## Cas 12 : POST /ads/999/applications (attendu 404)

Commande :

```bash
curl -i -X POST http://localhost:5000/ads/999/applications -H "Content-Type: application/json" -d '{"person_id": 3, "message": "Salut"}'
```

Code obtenu : 404

Réponse :

```json
{ "error": "Ad not found" }
```
