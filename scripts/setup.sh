#!/bin/bash

# Script de configuration initiale pour NEOSOFT.dev Backend API
# Usage: ./scripts/setup.sh

set -e

echo "🎯 Configuration initiale de l'API NEOSOFT.dev"
echo "=============================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Installez Node.js depuis: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Installation de Wrangler CLI
echo ""
echo "🔧 Installation de Wrangler CLI..."
npm install -g wrangler

# Authentification Cloudflare
echo ""
echo "🔐 Authentification Cloudflare..."
echo "Vous devez vous connecter à votre compte Cloudflare"
read -p "Appuyez sur Entrée pour continuer..."
wrangler login

# Création de la base de données D1
echo ""
echo "🗄️ Création de la base de données D1..."
echo "Création de la base de données 'neosoft_db'..."

DB_OUTPUT=$(wrangler d1 create neosoft_db 2>&1 || echo "exists")

if [[ $DB_OUTPUT == *"exists"* ]]; then
    echo "⚠️ La base de données existe déjà"
else
    echo "✅ Base de données créée avec succès"
    
    # Extraire l'ID de la base de données
    DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    
    if [ ! -z "$DB_ID" ]; then
        echo "📝 ID de la base de données: $DB_ID"
        echo ""
        echo "⚠️ IMPORTANT: Mettez à jour le fichier wrangler.toml"
        echo "Remplacez la ligne 'database_id = \"auto-generated-id\"'"
        echo "par: database_id = \"$DB_ID\""
        echo ""
        read -p "Appuyez sur Entrée après avoir mis à jour wrangler.toml..."
    fi
fi

# Application du schéma de base de données
echo ""
echo "📊 Application du schéma de base de données..."
wrangler d1 execute neosoft_db --file=./src/db/schema.sql

echo "✅ Schéma appliqué avec succès"

# Configuration des variables d'environnement
echo ""
echo "🔑 Configuration des variables d'environnement..."
echo ""
echo "Générez un token admin sécurisé:"
ADMIN_TOKEN=$(openssl rand -hex 32 2>/dev/null || echo "neosoft_$(date +%s)_$(shuf -i 1000-9999 -n 1)")
echo "Token généré: $ADMIN_TOKEN"
echo ""
echo "⚠️ IMPORTANT: Sauvegardez ce token en lieu sûr!"
echo "Mettez à jour la variable ADMIN_TOKEN dans wrangler.toml"

# Test de la configuration
echo ""
echo "🧪 Test de la configuration..."
echo "Compilation TypeScript..."
npm run type-check

echo "✅ Configuration terminée avec succès!"
echo ""
echo "🎉 Votre projet est prêt!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Mettez à jour wrangler.toml avec le database_id et le token admin"
echo "2. Testez en local: npm run dev"
echo "3. Déployez: ./scripts/deploy.sh"
echo ""
echo "📚 Documentation complète dans README.md"
