# 🚀 Guide de Déploiement - NEOSOFT.dev API

## ⚠️ Résolution de l'Erreur Cloudflare

Si vous obtenez l'erreur : `An unknown error occurred. Contact your account team or Cloudflare support`

## 🔧 Solutions Étape par Étape

### **1. Vérification des Prérequis**

```bash
# Vérifier Node.js (requis: v18+)
node --version

# Installer les dépendances
npm install
```

### **2. Installation et Configuration Wrangler**

```bash
# Installation locale (recommandée)
npm install wrangler --save-dev

# Ou installation globale
npm install -g wrangler

# Vérification
npx wrangler --version
```

### **3. Authentification Cloudflare**

```bash
# Se connecter à Cloudflare
npx wrangler login

# Vérifier l'authentification
npx wrangler whoami
```

### **4. Configuration de la Base de Données**

```bash
# Créer la base de données D1
npx wrangler d1 create neosoft_db

# ⚠️ IMPORTANT: Copier l'ID généré dans wrangler.toml
# Remplacer la ligne database_id dans wrangler.toml
```

### **5. Mise à Jour du wrangler.toml**

Après création de la DB, mettez à jour `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "neosoft_db"
database_id = "VOTRE_ID_GENERE_ICI"  # ← Remplacer par l'ID réel
```

### **6. Application du Schéma**

```bash
# Appliquer le schéma de base de données
npx wrangler d1 execute neosoft_db --file=./src/db/schema.sql
```

### **7. Test en Local**

```bash
# Démarrer en mode développement
npm run dev

# Tester l'API (nouveau terminal)
curl http://localhost:8787/health
```

### **8. Déploiement**

```bash
# Vérifier la configuration
npx wrangler whoami

# Déployer
npm run deploy
```

## 🐛 **Erreurs Courantes et Solutions**

### **Erreur: "Unknown error occurred"**
- ✅ Vérifiez l'authentification : `npx wrangler whoami`
- ✅ Vérifiez le database_id dans wrangler.toml
- ✅ Assurez-vous que la DB existe : `npx wrangler d1 list`

### **Erreur: "Database not found"**
```bash
# Lister les bases existantes
npx wrangler d1 list

# Créer si nécessaire
npx wrangler d1 create neosoft_db
```

### **Erreur: "Authentication required"**
```bash
# Se reconnecter
npx wrangler logout
npx wrangler login
```

### **Erreur: "Build failed"**
```bash
# Vérifier TypeScript
npm run type-check

# Installer les types manquants
npm install @types/node --save-dev
```

## 📋 **Checklist de Déploiement**

- [ ] Node.js v18+ installé
- [ ] `npm install` exécuté avec succès
- [ ] Wrangler installé et authentifié
- [ ] Base de données D1 créée
- [ ] `database_id` mis à jour dans wrangler.toml
- [ ] Schéma appliqué à la base
- [ ] Test local réussi
- [ ] Variables d'environnement configurées

## 🎯 **Commandes de Dépannage**

```bash
# Diagnostic complet
npx wrangler whoami
npx wrangler d1 list
npm run type-check

# Réinitialisation complète
npx wrangler logout
npx wrangler login
npx wrangler d1 create neosoft_db_new

# Test de connectivité
curl -I https://api.cloudflare.com/client/v4/zones
```

## 📞 **Support**

Si le problème persiste :
1. Vérifiez votre compte Cloudflare (limites, facturation)
2. Consultez : https://developers.cloudflare.com/workers/
3. Support Cloudflare : https://cfl.re/3WgEyrH

**Une fois ces étapes suivies, votre API devrait se déployer sans erreur ! 🚀**
