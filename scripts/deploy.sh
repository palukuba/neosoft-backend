#!/bin/bash

# Script de déploiement pour NEOSOFT.dev Backend API
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Déploiement de l'API NEOSOFT.dev en environnement: $ENVIRONMENT"

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI n'est pas installé"
    echo "Installez-le avec: npm install -g wrangler"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérification TypeScript
echo "🔍 Vérification TypeScript..."
npm run type-check

# Configuration de la base de données
echo "🗄️ Configuration de la base de données..."

# Créer la base de données si elle n'existe pas
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Création de la base de données de production..."
    wrangler d1 create neosoft_db --env production || echo "Base de données déjà existante"
    
    echo "Application du schéma de base de données..."
    wrangler d1 execute neosoft_db --env production --file=./src/db/schema.sql
else
    echo "Création de la base de données de développement..."
    wrangler d1 create neosoft_db || echo "Base de données déjà existante"
    
    echo "Application du schéma de base de données..."
    wrangler d1 execute neosoft_db --file=./src/db/schema.sql
fi

# Déploiement
echo "🚀 Déploiement de l'application..."

if [ "$ENVIRONMENT" = "production" ]; then
    wrangler publish --env production
else
    wrangler publish
fi

echo "✅ Déploiement terminé avec succès!"
echo ""
echo "🌐 Votre API est maintenant disponible"
echo "📚 Documentation: https://neosoft.dev/api/docs"
echo "🔍 Status: https://your-worker-url.workers.dev/health"
echo ""
echo "🔧 Commandes utiles:"
echo "  - Logs en temps réel: wrangler tail"
echo "  - Base de données locale: wrangler d1 execute neosoft_db --local --command='SELECT * FROM newsletter LIMIT 5'"
echo "  - Rollback: wrangler rollback"
