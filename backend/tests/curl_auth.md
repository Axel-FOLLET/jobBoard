# Tests de l'authentification (J3, Task04)

Tests rejoués le 07/10/2026 sur la branche `feature/auth` (inscription et connexion), après `python init_db.py` pour partir d'une base propre. Les réponses viennent du client de test de Flask, qui exécute le même code que le serveur ; la commande `curl` de chaque cas est celle à taper pour le refaire à la main.

| N° | Cas | Code attendu | Code obtenu |
|----|-----|--------------|-------------|
| 1 | register complet | 201 | 201 |
| 2 | même email une 2ᵉ fois | 409 | 409 |
| 3 | register sans password | 400 | 400 |
| 4 | login bon couple | 200 | 200 |
| 5 | login mauvais mot de passe | 401 | 401 |
| 6 | login email inconnu | 401 | 401 |
| 7 | login sans email | 400 | 400 |
| 8 | register avec un mot de passe de 5 caractères | 400 | 400 |
| 9 | register avec `Test@Example.com`, puis login avec `test@example.com` | 200 | 200 |

Aucune réponse de succès (cas 1, 4 et 9) ne contient `password` ni `password_hash`. Les cas 5 et 6 renvoient le même message (`Invalid credentials`), pour ne pas révéler si l'email existe.

Vérifications complémentaires : un `role` envoyé par le client à l'inscription est ignoré (le compte est créé avec le rôle `user`), et le mot de passe est stocké haché (jamais en clair).

À traiter au J4 (validation des types) : un mot de passe ou un email qui n'est pas du texte (un nombre par exemple) provoque encore une erreur 500 au lieu d'un 400.

## Cas 1 : register complet (attendu 201)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"first_name": "Alice", "last_name": "Test", "email": "alice.test@example.com", "password": "motdepasse1"}'
```

Code obtenu : 201

Réponse :

```json
{
  "email": "alice.test@example.com",
  "first_name": "Alice",
  "id": 4,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```


## Cas 2 : même email une 2ᵉ fois (attendu 409)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"first_name": "Alice", "last_name": "Test", "email": "alice.test@example.com", "password": "motdepasse1"}'
```

Code obtenu : 409

Réponse :

```json
{ "error": "Email already used" }
```


## Cas 3 : register sans password (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"first_name": "Alice", "last_name": "Test", "email": "alice.test@example.com"}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Missing field: password" }
```


## Cas 4 : login bon couple (attendu 200)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email": "alice.test@example.com", "password": "motdepasse1"}'
```

Code obtenu : 200

Réponse :

```json
{
  "email": "alice.test@example.com",
  "first_name": "Alice",
  "id": 4,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```


## Cas 5 : login mauvais mot de passe (attendu 401)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email": "alice.test@example.com", "password": "mauvais-mot-de-passe"}'
```

Code obtenu : 401

Réponse :

```json
{ "error": "Invalid credentials" }
```


## Cas 6 : login email inconnu (attendu 401)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email": "inconnu@example.com", "password": "motdepasse1"}'
```

Code obtenu : 401

Réponse :

```json
{ "error": "Invalid credentials" }
```


## Cas 7 : login sans email (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"password": "motdepasse1"}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Missing field: email" }
```


## Cas 8 : register avec un mot de passe de 5 caractères (attendu 400)

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"first_name": "Bob", "last_name": "Test", "email": "bob.test@example.com", "password": "12345"}'
```

Code obtenu : 400

Réponse :

```json
{ "error": "Password must be at least 8 characters" }
```


## Cas 9 : register avec Test@Example.com, puis login avec test@example.com (attendu 200)

Étape 1 : inscription avec une majuscule dans l'email (attendu 201, email enregistré en minuscules).

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"first_name": "Chloé", "last_name": "Test", "email": "Test@Example.com", "password": "motdepasse1"}'
```

Code obtenu : 201

Réponse :

```json
{
  "email": "test@example.com",
  "first_name": "Chlo\u00e9",
  "id": 5,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

Étape 2 : connexion avec l'email en minuscules (attendu 200).

Commande :

```bash
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "motdepasse1"}'
```

Code obtenu : 200

Réponse :

```json
{
  "email": "test@example.com",
  "first_name": "Chlo\u00e9",
  "id": 5,
  "last_name": "Test",
  "phone": null,
  "role": "user"
}
```

