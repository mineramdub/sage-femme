# 🚀 Configuration Supabase pour MidwifeCare

Ce guide vous explique comment configurer l'authentification et la base de données PostgreSQL avec Supabase.

---

## 📋 Étape 1 : Créer un projet Supabase

1. **Aller sur** [https://supabase.com](https://supabase.com)
2. **Se connecter** avec votre compte GitHub (ou créer un compte)
3. **Cliquer sur** "New Project"
4. **Remplir les informations** :
   - **Name** : `midwifecare` (ou le nom de votre choix)
   - **Database Password** : Choisir un mot de passe sécurisé (le sauvegarder !)
   - **Region** : Choisir `Europe (Frankfurt)` ou la région la plus proche
   - **Pricing Plan** : Sélectionner "Free" (gratuit jusqu'à 50k MAU)
5. **Cliquer sur** "Create new project"

⏱️ **Attendre 2-3 minutes** que le projet soit créé...

---

## 🔑 Étape 2 : Récupérer les clés API

Une fois le projet créé :

1. **Aller dans** "Project Settings" (icône ⚙️ en bas à gauche)
2. **Cliquer sur** "API" dans le menu latéral
3. **Copier** les deux valeurs suivantes :
   - **Project URL** (ressemble à `https://xxxxx.supabase.co`)
   - **anon public** key (longue clé commençant par `eyJ...`)

4. **Ouvrir** le fichier `.env.local` à la racine du projet
5. **Remplacer** les placeholders :
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 🗄️ Étape 3 : Créer le schéma de base de données

1. **Dans Supabase**, aller dans **"SQL Editor"** (icône 📝 dans le menu latéral)
2. **Cliquer sur** "New query"
3. **Ouvrir** le fichier `supabase-schema.sql` à la racine de ce projet
4. **Copier tout le contenu** du fichier
5. **Coller** dans l'éditeur SQL de Supabase
6. **Cliquer sur** "Run" (bouton en bas à droite) ou appuyer sur `Ctrl+Enter`

✅ Vous devriez voir : "Success. No rows returned"

---

## 🔐 Étape 4 : Configurer les providers OAuth

### 4.1 Google OAuth

1. **Dans Supabase**, aller dans **"Authentication" > "Providers"**
2. **Trouver** "Google" et cliquer sur l'icône ⚙️
3. **Activer** le toggle "Enable Sign in with Google"

#### Option A : Mode développement (Rapide)
- Supabase fournit des credentials par défaut
- **Laisser** les champs vides et **sauvegarder**
- ⚠️ L'écran de connexion affichera "Non vérifié" mais ça fonctionne

#### Option B : Production (Recommandé)
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer "Google+ API"
4. Créer des identifiants OAuth 2.0
5. Ajouter les Redirect URIs :
   - `https://[votre-project-ref].supabase.co/auth/v1/callback`
6. Copier le **Client ID** et **Client Secret** dans Supabase

---

### 4.2 Microsoft / Azure OAuth

1. **Dans Supabase**, aller dans **"Authentication" > "Providers"**
2. **Trouver** "Azure" et cliquer sur l'icône ⚙️
3. **Activer** le toggle

Pour obtenir les credentials :
1. Aller sur [Azure Portal](https://portal.azure.com)
2. Aller dans "Azure Active Directory" > "App registrations"
3. Cliquer sur "New registration"
4. Configurer :
   - **Name** : MidwifeCare
   - **Redirect URI** : `https://[votre-project-ref].supabase.co/auth/v1/callback`
5. Copier **Application (client) ID** → Mettre dans "Azure Client ID" sur Supabase
6. Créer un "Client Secret" et le copier → Mettre dans "Azure Secret" sur Supabase

---

### 4.3 Apple Sign In

1. **Dans Supabase**, aller dans **"Authentication" > "Providers"**
2. **Trouver** "Apple" et cliquer sur l'icône ⚙️
3. **Activer** le toggle

Pour obtenir les credentials :
1. Aller sur [Apple Developer](https://developer.apple.com/account)
2. Créer un "Services ID"
3. Configurer "Sign in with Apple"
4. Ajouter le Redirect URI : `https://[votre-project-ref].supabase.co/auth/v1/callback`
5. Copier les identifiants dans Supabase

**Note** : Apple Sign In est plus complexe à configurer. Pour démarrer rapidement, vous pouvez commencer avec Google et Microsoft seulement.

---

## ✅ Étape 5 : Tester la connexion

1. **Redémarrer** le serveur de développement :
   ```bash
   pnpm run dev
   ```

2. **Ouvrir** http://localhost:3000

3. Vous devriez voir **la page de connexion** avec :
   - ✅ Bouton "Continuer avec Google"
   - ✅ Bouton "Continuer avec Microsoft"
   - ✅ Bouton "Continuer avec Apple"
   - ✅ Formulaire Email/Password

4. **Tester** la connexion avec Google (le plus rapide à configurer)

---

## 🐛 Dépannage

### Erreur : "Invalid API key"
- Vérifier que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien remplies dans `.env.local`
- Redémarrer le serveur après avoir modifié `.env.local`

### Erreur OAuth : "redirect_uri_mismatch"
- Vérifier que l'URL de redirection dans Google/Azure/Apple correspond exactement à :
  `https://[votre-project-ref].supabase.co/auth/v1/callback`

### Les tables ne sont pas créées
- Vérifier dans Supabase Dashboard > "Table Editor" si les tables apparaissent
- Relancer le script SQL complet si nécessaire

### Email de confirmation non reçu
- Vérifier les spams
- Dans Supabase > "Authentication" > "URL Configuration", vérifier que "Site URL" est bien configuré

---

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Guide OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 C'est tout !

Une fois configuré, l'application :
- ✅ Authentifie les utilisateurs avec Google, Microsoft, Apple ou Email
- ✅ Stocke les données dans PostgreSQL (plus de localStorage)
- ✅ Sécurise les données avec RLS (chaque sage-femme ne voit que SES patientes)
- ✅ Synchronise sur tous les appareils automatiquement
