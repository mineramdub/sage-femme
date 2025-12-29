# 🌸 MidwifeCare - Gestion de Patientèle

Application web moderne et intuitive pour la gestion de patientèle des sages-femmes libérales.

![MidwifeCare](https://img.shields.io/badge/Version-1.0.0-rose?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.17-cyan?style=for-the-badge&logo=tailwindcss)

## ✨ Fonctionnalités

### 🏥 Gestion de Patientèle
- **Vue en grille** des dossiers patients avec codage couleur par statut
- **Recherche en temps réel** par nom ou prénom
- **Édition inline** de tous les champs (simple clic pour éditer)
- **Ajout rapide** de nouvelles patientes

### 📅 Calendrier Intelligent
- Vue mensuelle avec navigation fluide
- Rendez-vous codés par couleur selon le type
- Highlight du jour actuel
- Légende interactive

### 🤖 Assistant IA Expert (Gemini)
- **Analyse contextuelle** : Double-clic sur n'importe quel champ pour obtenir une analyse IA instantanée
- **Support de protocoles** : Import de texte ou fichiers PDF
- **Mode strict** : Réponses basées uniquement sur les documents fournis
- **Contexte patient automatique** : L'IA connaît les informations de la patiente sélectionnée

### 📋 Templates de Consultation
5 templates prédéfinis avec champs spécifiques :
- Suivi Mensuel Grossesse
- Consultation Contraception
- Suivi Postnatal
- Gynécologie de prévention
- Urgences / Autre

### 📝 Bloc-notes Coloré
- Widget flottant non intrusif
- 5 couleurs pour catégoriser les tâches
- Persistance automatique (LocalStorage)
- Checkbox pour marquer les tâches complétées

### 📱 Responsive Mobile
- Navigation adaptative (sidebar → bottom nav)
- Interface tactile optimisée
- Design cohérent sur tous les écrans

## 🚀 Installation

### Prérequis
- Node.js 18+ (recommandé : 20+)
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd sage-femme
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la clé API Gemini**

   Le fichier `.env.local` est déjà configuré avec une clé API. Pour utiliser votre propre clé :
   - Obtenez une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Modifiez `.env.local` :
   ```
   VITE_GEMINI_API_KEY=votre_clé_ici
   ```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir l'application**

   Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du Projet

```
sage-femme/
├── src/
│   ├── components/
│   │   ├── AddPatientModal.tsx    # Modal d'ajout patiente
│   │   ├── CalendarView.tsx       # Vue calendrier
│   │   ├── PatientCard.tsx        # Carte résumé patiente
│   │   └── PatientDetails.tsx     # Dossier patient complet
│   ├── services/
│   │   └── geminiService.ts       # Service IA Gemini
│   ├── App.tsx                    # Composant principal
│   ├── constants.ts               # Constantes & mock data
│   ├── index.css                  # Styles globaux
│   ├── main.tsx                   # Point d'entrée
│   └── types.ts                   # Types TypeScript
├── .env.local                     # Variables d'environnement
├── index.html                     # HTML racine
├── package.json                   # Dépendances
├── tailwind.config.js            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── vite.config.ts                # Config Vite
```

## 🎨 Stack Technique

- **Frontend** : React 19.0.0 + TypeScript 5.8.0
- **Build** : Vite 6.0.0
- **Styling** : Tailwind CSS 3.4.17
- **Icons** : lucide-react 0.462.0
- **IA** : Google Generative AI 0.21.0
- **Persistance** : LocalStorage

## 📖 Guide d'Utilisation

### Ajouter une Patiente
1. Clic sur "Nouvelle Patiente" (header)
2. Remplir le formulaire
3. Valider → La patiente apparaît dans la grille

### Consulter un Dossier
1. Clic sur une carte patiente
2. Le dossier complet s'ouvre en modal
3. Double-clic sur n'importe quel champ → Analyse IA

### Éditer des Informations
1. Clic sur un champ éditable (icône Edit3 au hover)
2. Modification du contenu
3. Clic en dehors → Sauvegarde automatique

### Ajouter une Consultation
1. Depuis le dossier patient → "NOUVELLE CONSULTATION"
2. Sélection du motif (template)
3. Saisie des paramètres cliniques
4. "TERMINER" → Ajout à l'historique

### Utiliser l'Assistant IA
1. Onglet "Assistant IA"
2. (Optionnel) Configurer protocole/PDF
3. Poser une question
4. "Consulter l'IA" → Réponse instantanée

### Gérer le Bloc-notes
1. Clic sur le bouton flottant (StickyNote)
2. Sélection de couleur
3. Ajout de tâches
4. Checkbox pour marquer complété

## 🔐 Sécurité & RGPD

⚠️ **Version de développement** - Ne pas utiliser en production sans :
- Backend sécurisé avec authentification
- Chiffrement des données sensibles
- Conformité RGPD (consentement, traçabilité, etc.)
- Hébergement HDS (Hébergeur de Données de Santé)

Actuellement :
- Données stockées en LocalStorage (non chiffré)
- Clé API Gemini dans .env.local (ne pas commit)
- Pas d'authentification utilisateur

## 🚀 Build Production

```bash
npm run build
```

Les fichiers optimisés seront générés dans `dist/`.

Pour prévisualiser la version production :
```bash
npm run preview
```

## 🎯 Améliorations Futures

### Priorité Haute
- [ ] Backend avec authentification JWT
- [ ] Base de données sécurisée (PostgreSQL)
- [ ] Gestion de calendrier complète (CRUD rendez-vous)
- [ ] Notifications & rappels automatiques
- [ ] Export PDF des dossiers

### Priorité Moyenne
- [ ] Statistiques & reporting
- [ ] Upload de documents (ordonnances, résultats)
- [ ] Templates de consultation personnalisables
- [ ] Mode offline (PWA)
- [ ] Tests automatisés

### Priorité Basse
- [ ] Dark mode
- [ ] Facturation intégrée
- [ ] Synchronisation Google Calendar
- [ ] Transcription vocale → notes
- [ ] Signature électronique

## 📝 Licence

MIT

## 👥 Auteurs

Créé avec ❤️ par Claude Code basé sur les spécifications du projet sage-femme-connect original.

---

**Note** : Cette application a été générée automatiquement à partir des spécifications détaillées dans INDEX.md. Pour toute question ou amélioration, consultez la documentation complète.
