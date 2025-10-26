# Documentation API NEOSOFT.dev

## Base URL
```
Production: https://api.neosoft.dev
Development: http://localhost:8787
```

## Authentification

Les routes admin nécessitent un token Bearer dans le header :
```
Authorization: Bearer <ADMIN_TOKEN>
```

## Endpoints

### 🏠 Status & Santé

#### GET /
Informations générales sur l'API
```json
{
  "success": true,
  "message": "NEOSOFT.dev API Backend",
  "version": "1.0.0",
  "status": "operational"
}
```

#### GET /health
Vérification de l'état de l'API et de la base de données
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### 📧 Newsletter

#### POST /api/newsletter
Inscription à la newsletter

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inscription réussie !",
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### GET /api/newsletter 🔒
Lister les abonnés (Admin uniquement)

**Query params:**
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "subscribers": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

---

### 📞 Contact

#### POST /api/contact
Envoyer un message de contact

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Demande d'information",
  "message": "Bonjour, j'aimerais en savoir plus..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message envoyé avec succès !",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET /api/contact 🔒
Lister les messages (Admin uniquement)

---

### 📅 Rendez-vous

#### POST /api/appointments
Prendre un rendez-vous

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+33123456789",
  "date": "2025-01-15T14:00:00Z",
  "service": "Développement Web",
  "message": "Projet e-commerce"
}
```

**Services disponibles:**
- Développement Web
- Développement Mobile
- Développement Desktop
- Intelligence Artificielle
- Consultation technique
- Audit de code
- Formation
- Autre

#### GET /api/appointments 🔒
Lister les rendez-vous (Admin uniquement)

#### PUT /api/appointments/:id/status 🔒
Mettre à jour le statut d'un rendez-vous

**Body:**
```json
{
  "status": "confirmed"
}
```

**Statuts disponibles:** `pending`, `confirmed`, `completed`, `cancelled`

---

### 💼 Commandes

#### POST /api/orders
Créer une commande/devis

**Body:**
```json
{
  "client_name": "Entreprise ABC",
  "email": "contact@abc.com",
  "service": "Site Web E-commerce",
  "details": "Boutique en ligne avec 100 produits",
  "price": 5000.00
}
```

#### GET /api/orders 🔒
Lister les commandes (Admin uniquement)

**Query params:**
- `status`: filtrer par statut
- `service`: filtrer par service

---

### 📝 Articles

#### GET /api/articles
Lister les articles publiés

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)

#### GET /api/articles/:slug
Récupérer un article spécifique

#### POST /api/articles 🔒
Créer un article (Admin uniquement)

**Body:**
```json
{
  "title": "Titre de l'article",
  "slug": "titre-de-larticle",
  "content": "Contenu complet...",
  "author": "Équipe NEOSOFT",
  "tags": "web,javascript,hono"
}
```

---

### 🎨 Portfolio

#### GET /api/portfolio
Lister les projets du portfolio

**Query params:**
- `category`: filtrer par catégorie
- `featured`: `true` pour les projets mis en avant

#### POST /api/portfolio 🔒
Ajouter un projet (Admin uniquement)

**Body:**
```json
{
  "title": "Site E-commerce ABC",
  "description": "Boutique en ligne moderne",
  "image_url": "https://example.com/image.jpg",
  "category": "Web",
  "link": "https://abc-shop.com",
  "technologies": "React,Node.js,MongoDB",
  "featured": true
}
```

**Catégories disponibles:** `Web`, `Mobile`, `Desktop`, `IA`, `Design`, `Autre`

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide |
| 401  | Token manquant |
| 403  | Token invalide |
| 404  | Ressource non trouvée |
| 409  | Conflit (ex: email déjà inscrit) |
| 413  | Requête trop volumineuse |
| 500  | Erreur serveur |

## Format des erreurs

```json
{
  "error": "Type d'erreur",
  "message": "Description détaillée"
}
```

## Limites

- Taille max des requêtes : 1MB
- Rate limiting : Appliqué automatiquement
- CORS : Autorisé uniquement depuis `https://neosoft.dev`
