# NEOSOFT.dev Backend API

API backend complète pour NEOSOFT.dev construite avec Hono.js et Cloudflare D1.

## 🚀 Fonctionnalités

- **Newsletter** : Gestion des abonnés
- **Contact** : Formulaire de contact
- **Rendez-vous** : Planification de meetings
- **Commandes** : Gestion des devis et commandes
- **Articles** : Blog et actualités
- **Portfolio** : Présentation des réalisations

## 🛠️ Technologies

- **Framework** : Hono.js
- **Base de données** : Cloudflare D1 (SQLite)
- **Déploiement** : Cloudflare Workers
- **Langage** : TypeScript

## 📦 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd neosoft-backend

# Installer les dépendances
npm install

# Créer la base de données D1
npm run db:create

# Appliquer le schéma
npm run db:migrate
```

## 🔧 Configuration

1. Modifier `wrangler.toml` avec votre `database_id`
2. Configurer les variables d'environnement :
   - `ADMIN_TOKEN` : Token d'authentification admin
   - `ALLOWED_ORIGIN` : Domaine autorisé (https://neosoft.dev)

## 🚀 Déploiement

```bash
# Développement local
npm run dev

# Déploiement en production
npm run deploy
```

## 📚 API Endpoints

### Publics
- `POST /api/newsletter` - S'abonner à la newsletter
- `POST /api/contact` - Envoyer un message
- `POST /api/appointments` - Prendre rendez-vous
- `POST /api/orders` - Créer une commande
- `GET /api/articles` - Lister les articles
- `GET /api/articles/:slug` - Article spécifique
- `GET /api/portfolio` - Voir le portfolio

### Admin (Token requis)
- `GET /api/newsletter` - Lister les abonnés
- `GET /api/contact` - Lister les messages
- `GET /api/appointments` - Lister les RDV
- `GET /api/orders` - Lister les commandes
- `POST /api/articles` - Créer un article
- `POST /api/portfolio` - Ajouter un projet

## 🔐 Authentification

Les routes admin nécessitent un header :
```
Authorization: Bearer <ADMIN_TOKEN>
```

## 🌐 CORS

L'API autorise uniquement les requêtes depuis `https://neosoft.dev`.

## 📊 Exemple d'utilisation

```javascript
// Inscription newsletter
const response = await fetch('https://api.neosoft.dev/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
```

## 🏗️ Structure du projet

```
src/
├── index.ts              # Point d'entrée
├── routes/
│   ├── newsletter.ts
│   ├── contact.ts
│   ├── appointments.ts
│   ├── orders.ts
│   ├── articles.ts
│   └── portfolio.ts
├── utils/
│   ├── auth.ts           # Authentification
│   └── cors.ts           # CORS et sécurité
└── db/
    └── schema.sql        # Schéma de base
```

## 📝 License

MIT License - NEOSOFT.dev
