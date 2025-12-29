# SAGE-FEMME CONNECT - Spécifications Fonctionnelles Complètes

## 📋 Vue d'ensemble du projet

**MidwifeCare** est une application web de gestion de patientèle destinée aux sages-femmes libérales. Elle permet de gérer les dossiers patients, planifier les rendez-vous, consulter un assistant IA médical et organiser son travail quotidien.

### Stack Technique
- **Frontend** : React 19.2.3 + TypeScript
- **Build** : Vite 6.2.0
- **Styling** : Tailwind CSS (classes utilitaires)
- **Icons** : lucide-react 0.562.0
- **IA** : Google Gemini API (@google/genai 1.34.0)
- **Stockage** : LocalStorage (persistance côté client)

---

## 🎨 Design System & UX

### Palette de Couleurs
- **Couleur principale** : Rose (#e11d48 - rose-600)
  - Rose clair : bg-rose-50, bg-rose-100
  - Bordures : border-rose-100, border-rose-200
  - Ombres : shadow-rose-100, shadow-rose-200

- **Couleurs de statut** :
  - **Prénatal** : Rose (rose-50/700/100)
  - **Postnatal** : Vert émeraude (emerald-50/700/100)
  - **Gynécologie** : Violet (purple-50/700/100)
  - **Urgent** : Rouge (red-50/700/100)

- **Couleurs de rendez-vous** :
  - **Gynécologie** : Violet
  - **Obstétrique** : Rose
  - **Échographie** : Cyan
  - **Urgent** : Rouge

- **Couleurs du bloc-notes** :
  - Rose, Violet, Vert émeraude, Jaune ambré, Bleu ciel

### Typographie
- **Titres principaux** : text-3xl, font-black, tracking-tight/tighter
- **Sous-titres** : text-xl/2xl, font-bold
- **Labels** : text-xs, font-black, uppercase, tracking-wider/widest
- **Corps de texte** : text-sm/base, font-medium
- **Police** : font-sans (système)

### Design Pattern
- **Arrondis prononcés** :
  - Cartes : rounded-2xl (16px), rounded-3xl (24px)
  - Modales : rounded-[2.5rem], rounded-[3rem]
  - Boutons : rounded-xl, rounded-2xl
  - Inputs : rounded-xl, rounded-[1.2rem]

- **Ombres** :
  - shadow-sm (légère)
  - shadow-lg, shadow-xl, shadow-2xl (progressives)
  - shadow-{color}-100 (ombres colorées)

- **Espacements** :
  - Padding sections : p-6, p-8, p-10
  - Gap grilles : gap-6, gap-8, gap-10
  - Marges : mb-4, mb-6, mb-8, mb-10

### Animations & Transitions
- **Animations d'entrée** :
  - `animate-in fade-in slide-in-from-bottom-2 duration-300`
  - `animate-in zoom-in-95 duration-200`
  - `animate-in slide-in-from-top-4 duration-300`

- **Transitions** :
  - Hover : `hover:scale-[1.02]`, `hover:bg-rose-50`, `hover:shadow-md`
  - Active : `active:scale-95`
  - Loading : `animate-spin` (Loader2)

- **États visuels** :
  - Hover sur cartes : scale + shadow
  - Focus inputs : ring-2, ring-rose-200
  - Édition inline : border-rose-200, ring-4, ring-rose-50

### Responsive Design
- **Desktop** : Sidebar latérale fixe (w-64)
- **Mobile** :
  - Sidebar cachée
  - Navigation flottante en bas (fixed bottom-0)
  - Padding-bottom ajusté (pb-20)
  - Burger menu visible (md:hidden)

---

## 📊 Modèle de Données

### Types Principaux

#### PatientStatus (Enum)
```typescript
enum PatientStatus {
  PRENATAL = 'Prénatal',
  POSTNATAL = 'Postnatal',
  GYNECO = 'Gynécologie',
  URGENT = 'Urgent'
}
```

#### AppointmentType (Enum)
```typescript
enum AppointmentType {
  GYNECO = 'Gynécologie',
  OBSTETRIQUE = 'Obstétrique',
  ECHO = 'Échographie',
  URGENT = 'Urgent'
}
```

#### Visit (Interface)
Représente une consultation/visite passée.
```typescript
interface Visit {
  id: string;
  date: string; // Format YYYY-MM-DD
  type: string; // Type de consultation
  notes: string; // Notes cliniques
  measurements?: {
    weight?: number; // Poids (kg)
    bloodPressure?: string; // Tension artérielle (ex: "120/80")
    heartRate?: number; // Pouls
    fetalHeartRate?: number; // RCF - Rythme Cardiaque Fœtal
    glucose?: number; // Glycémie
    triglycerides?: number; // Triglycérides
    uterineHeight?: number; // Hauteur Utérine
    smoking?: boolean; // Tabac
  };
}
```

#### MedicalHistory (Interface)
Antécédents médicaux.
```typescript
interface MedicalHistory {
  medical: string; // Antécédents médicaux
  surgical: string; // Antécédents chirurgicaux
  family: string; // Antécédents familiaux
  obstetrical: string; // Antécédents obstétricaux
  allergies: string; // Allergies
  treatments: string; // Traitements en cours
}
```

#### Patient (Interface)
Dossier patient complet.
```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // Format YYYY-MM-DD
  phone: string;
  email: string;
  status: PatientStatus;
  lastVisit: string; // Date dernière visite
  nextAppointment: string; // Date prochain RDV
  nextConsultationReminders: string; // Mémo pour prochaine consultation
  lastSmearDate?: string; // Date dernier frottis (gynéco)
  pregnancyInfo?: {
    ddr: string; // Date des Dernières Règles
    dpa: string; // Date Prévue d'Accouchement
    gravidity: number; // Nombre de grossesses (G)
    parity: number; // Nombre d'accouchements (P)
    bloodType: string; // Groupe sanguin
  };
  medicalHistory: MedicalHistory;
  history: Visit[]; // Historique des consultations
}
```

#### Appointment (Interface)
Rendez-vous.
```typescript
interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Format: "NOM Prénom"
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:mm
  type: AppointmentType;
}
```

#### Task (Interface)
Tâche du bloc-notes.
```typescript
interface Task {
  id: string;
  text: string;
  completed: boolean;
  color: string; // Classe CSS Tailwind
}
```

---

## 🏗️ Architecture des Composants

### App.tsx (Composant Principal)

**Responsabilités** :
- Gestion de l'état global de l'application
- Routage entre les 3 onglets principaux
- Persistance LocalStorage
- Coordination des composants enfants

**États principaux** :
```typescript
- patients: Patient[] // Liste des patientes (initialisée depuis LocalStorage ou MOCK_PATIENTS)
- searchTerm: string // Terme de recherche
- selectedPatientId: string | null // ID patiente sélectionnée
- activeTab: 'patients' | 'ai' | 'calendar' // Onglet actif
- isAddingPatient: boolean // Modal d'ajout visible
- aiPrompt: string // Question pour l'IA
- aiResponse: string // Réponse de l'IA
- isAiLoading: boolean // État de chargement IA
- protocolText: string // Protocole personnalisé (texte)
- isStrictEnabled: boolean // Mode strict de l'IA (obsolète dans le code actuel)
- showProtocolEditor: boolean // Afficher l'éditeur de protocole
- attachedFile: {name, data} | null // Fichier PDF attaché
- tasks: Task[] // Liste des tâches (bloc-notes)
- showTasks: boolean // Afficher le widget de tâches
- newTaskText: string // Texte nouvelle tâche
- selectedTaskColor: string // Couleur sélectionnée pour nouvelle tâche
```

**Fonctions principales** :
- `handleUpdatePatient(updatedPatient)` : Met à jour une patiente
- `handleAddPatient(newPatient)` : Ajoute une nouvelle patiente
- `handleFileChange(e)` : Upload fichier PDF et conversion en base64
- `handleAiConsult(e)` : Soumet une question à l'assistant IA
- `addTask(e)` : Ajoute une tâche au bloc-notes
- `toggleTask(id)` : Marque une tâche comme complétée/non complétée
- `deleteTask(id)` : Supprime une tâche

**Structure UI** :
1. **Sidebar (Desktop uniquement)** :
   - Logo MidwifeCare
   - Navigation (Patientèle, Calendrier, Assistant IA)
   - Profil de la sage-femme (Mme. Dupont)

2. **Header** :
   - Menu burger (mobile)
   - Barre de recherche patiente (desktop)
   - Notifications (badge rouge)
   - Bouton "Nouvelle Patiente"

3. **Main Content** :
   - **Onglet Patientèle** : Grille de PatientCard
   - **Onglet Calendrier** : CalendarView
   - **Onglet Assistant IA** : Interface de consultation IA

4. **Widget Bloc-notes flottant** :
   - Bouton flottant (bottom-right)
   - Panel extensible avec :
     - Liste des tâches (checkbox, texte, delete)
     - Sélecteur de couleur (5 couleurs)
     - Input + bouton d'ajout

5. **Navigation Mobile** :
   - Barre fixe en bas
   - 3 onglets : Patientèle, Agenda, Assistant

6. **Modales** :
   - `AddPatientModal` : Création nouvelle patiente
   - `PatientDetails` : Dossier patient complet

---

### PatientCard.tsx

**Responsabilités** :
- Afficher une carte résumée d'une patiente
- Navigation vers le dossier détaillé au clic

**Props** :
```typescript
{
  patient: Patient;
  onClick: (id: string) => void;
}
```

**Affichage** :
- **Header** :
  - Nom complet (NOM EN MAJUSCULES Prénom)
  - Téléphone
  - Badge de statut (codé couleur)

- **Corps** :
  - **Si Prénatal/Postnatal** : Date Prévue d'Accouchement (DPA)
  - **Si Gynéco** : Date du dernier frottis
  - **Toujours** : Prochain RDV (en rose, mis en valeur)

**Design** :
- Bordure gauche colorée (4px) selon le statut
- Hover : légère élévation (scale + shadow)
- Transition fluide

---

### PatientDetails.tsx

**Responsabilités** :
- Afficher le dossier patient complet
- Permettre l'édition inline de tous les champs
- Ajouter une nouvelle consultation
- Consultation IA rapide (double-clic sur n'importe quel champ)

**Props** :
```typescript
{
  patient: Patient;
  onClose: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}
```

**États** :
```typescript
- mode: 'view' | 'addVisit' // Mode d'affichage
- insight: {term: string, content: string} | null // Analyse IA en cours
- isInsightLoading: boolean
- selectedTemplate: keyof CONSULTATION_TEMPLATES // Template de consultation sélectionné
- newVisit: Partial<Visit> // Données de la nouvelle visite en cours
```

**Templates de Consultation** :
5 templates prédéfinis avec champs spécifiques :

1. **Suivi Mensuel Grossesse**
   - Champs : Poids, TA, RCF, HU, Albumine/Sucre
   - Notes par défaut : "Évolution normale. Tension stable."

2. **Consultation Contraception**
   - Champs : TA, Poids, Pouls, Tabac, Glycémie, Triglycérides, ATCD Cardio
   - Notes : Explications contraception + bilan biologique

3. **Suivi Postnatal**
   - Champs : TA, Poids, Cicatrisation, Allaitement, Moral/EPDS
   - Notes : Examen postnatal + discussion périnée/contraception

4. **Gynécologie de prévention**
   - Champs : TA, Poids, Dernier Frottis, Palpation Mammaire
   - Notes : Examen gynéco de routine

5. **Urgences / Autre**
   - Champs : Motif, TA, Poids
   - Notes : vide (libre)

**Composants internes** :

#### EditableText
Composant d'édition inline.
- **Affichage** : Texte avec icône Edit3 au hover
- **Édition** : Input ou textarea avec focus automatique
- **Sauvegarde** : onBlur (perte de focus)
- Props : `path, value, isTextArea, className, label`

#### HistorySection
Section d'antécédent médical.
- Icône + titre
- EditableText pour le contenu
- Double-clic → Analyse IA rapide
- Indicateur "Double-clic : IA" au hover

**Structure UI** :

1. **Header Modal** :
   - Avatar initiales (rond, couleur selon statut)
   - Nom/Prénom (éditables inline)
   - Badge de statut
   - Date de naissance (éditable)
   - Email
   - Bouton "NOUVELLE CONSULTATION" (si mode view)
   - Bouton fermeture (X)

2. **Zone Mémo** (mode view uniquement) :
   - Fond jaune/ambré
   - Icône Pin épinglée
   - Texte éditable : rappels pour prochaine séance
   - Style post-it

3. **Mode View** :

   a. **État de Suivi** :
      - Catégorie (statut)
      - DPA estimée (si grossesse)
      - Gravidity / Parity (G/P)
      - Tous éditables inline

   b. **Dossier Médical & Antécédents** (grille 3 colonnes) :
      - Médicaux (icône Stethoscope, bleu ciel)
      - Chirurgicaux (icône Scissors, gris)
      - Familiaux (icône Users2, vert)
      - Obstétricaux (icône Baby, violet)
      - Traitements (icône Pill, rose)
      - Allergies (fond rouge, icône AlertCircle, rouge)

   c. **Historique des Visites** :
      - Liste chronologique inversée (plus récent en haut)
      - Chaque visite : icône ClipboardList, type, date, notes
      - Message si aucune visite

4. **Mode AddVisit** :

   a. **Sélection du motif** :
      - Grille 3 colonnes
      - Boutons larges pour chaque template
      - Sélection visuelle (bg-rose-600 + scale)

   b. **Informations de la séance** :
      - Date séance (input date)
      - Type exact (input text pré-rempli par template)

   c. **Paramètres cliniques** :
      - Grille adaptative selon les champs du template
      - Inputs avec mapping automatique vers measurements

   d. **Observations détaillées** :
      - Textarea grande (h-40)
      - Notes pré-remplies par template (modifiables)

   e. **Actions** :
      - Annuler (retour mode view)
      - TERMINER (icône Check, sauvegarde)

5. **Overlay IA** (si insight actif) :
   - Overlay plein écran (z-index 70)
   - Header : icône Zap, titre "Analyse IA", sujet
   - Corps :
     - Loading : spinner + "Consultation IA..."
     - Résultat : texte formaté, fond rose clair
   - Bouton OK (fermeture)

**Fonctionnalités IA** :
- **Double-clic sur n'importe quel champ** → `handleQuickInsight(term)`
  - Envoie le contenu du champ à l'IA
  - Contexte : nom, prénom, statut de la patiente
  - Retourne : points de vigilance, examens à prévoir, conseils pratiques
  - Affichage en overlay modal

---

### CalendarView.tsx

**Responsabilités** :
- Afficher un calendrier mensuel
- Visualiser les rendez-vous par jour
- Navigation entre les mois

**Props** :
```typescript
{
  appointments: Appointment[];
}
```

**États** :
```typescript
- currentDate: Date // Mois en cours
```

**Fonctions** :
- `daysInMonth(year, month)` : Nombre de jours dans le mois
- `firstDayOfMonth(year, month)` : Premier jour du mois (0-6)
- `prevMonth()` : Mois précédent
- `nextMonth()` : Mois suivant
- `getAppointmentsForDay(day)` : Rendez-vous pour un jour donné
- `getColorClass(type)` : Couleur selon le type de rendez-vous

**Structure UI** :

1. **Header** :
   - Titre : "Mois Année" (ex: "Juin 2024")
   - Navigation :
     - Bouton mois précédent (ChevronLeft)
     - Bouton "Aujourd'hui" (reset)
     - Bouton mois suivant (ChevronRight)

2. **En-tête jours** :
   - Grille 7 colonnes (Lun-Dim)
   - Fond gris clair
   - Texte uppercase, petit, gras

3. **Grille calendrier** :
   - 7 colonnes × N lignes
   - Hauteur fixe par cellule (120px)
   - Alignement semaine commençant lundi
   - Cellules vides (jours hors mois) : fond gris clair

4. **Cellule jour** :
   - Numéro du jour :
     - Normal : text-slate-500
     - Aujourd'hui : bg-rose-600, text-white, rond, shadow
   - Liste des rendez-vous (scrollable) :
     - Badge coloré selon type
     - Icône Clock + heure
     - Nom de la patiente (tronqué)
     - Hover : légère ombre

5. **Légende** (footer) :
   - Fond gris clair
   - Liste horizontale des types de rendez-vous
   - Pastille colorée + label

**Alignement** :
- Semaine commence le lundi (décalage calculé)
- Cellules vides avant le 1er du mois

---

### AddPatientModal.tsx

**Responsabilités** :
- Formulaire de création d'une nouvelle patiente
- Validation basique (champs required)

**Props** :
```typescript
{
  onClose: () => void;
  onAdd: (patient: Patient) => void;
}
```

**États** :
```typescript
- formData: Partial<Patient> // Données du formulaire
```

**Champs du formulaire** :
1. **Prénom** (required, text)
2. **Nom** (required, text)
3. **Date de naissance** (required, date)
4. **Téléphone** (required, tel)
5. **Email** (text)
6. **Statut** (select, enum PatientStatus)

**Comportement** :
- Submit → Création du Patient avec :
  - id : timestamp
  - lastVisit : aujourd'hui
  - nextAppointment : aujourd'hui + 7 jours
  - medicalHistory : vide
  - history : tableau vide
  - pregnancyInfo : non défini (à compléter ensuite)

**Structure UI** :
1. **Header modal** :
   - Fond rose-600, texte blanc
   - Icône UserPlus
   - Titre "Nouvelle Patiente"
   - Bouton fermeture (X)

2. **Corps formulaire** :
   - Grille 2 colonnes (prénom/nom)
   - Champs empilés (date, téléphone, email, statut)
   - Inputs arrondis, border standard

3. **Footer** :
   - Bouton "Annuler" (bordure, gris)
   - Bouton "Créer la fiche" (bg-rose-600, icône Save)

---

## 🤖 Service IA - geminiService.ts

### Configuration
- **API** : Google Gemini (@google/genai)
- **Clé API** : `process.env.API_KEY` (stockée dans .env.local comme GEMINI_API_KEY)
- **Modèle** : `gemini-3-flash-preview`

### Fonctions

#### 1. getQuickClinicalInsight
**Usage** : Analyse rapide d'un terme médical au double-clic.

**Paramètres** :
```typescript
term: string // Terme à analyser
context: Patient // Contexte de la patiente
```

**System Instruction** :
```
Tu es un assistant expert pour les sages-femmes libérales.
La sage-femme a double-cliqué sur un terme spécifique : "${term}".
Analyse ce terme en fonction du contexte de la patiente.
Indique précisément :
1. Les points de vigilance (risques potentiels).
2. Les examens ou suivis spécifiques à prévoir.
3. Des conseils pratiques pour la consultation.
Réponds de manière concise, sous forme de tirets, sur un ton professionnel.
```

**Température** : 0.2 (réponses précises, peu de créativité)

**Retour** : Texte formaté avec tirets

---

#### 2. getAIAdvisorResponse
**Usage** : Consultation IA complète avec support de protocoles et PDF.

**Paramètres** :
```typescript
prompt: string // Question de la sage-femme
customProtocol?: string // Protocole textuel personnalisé
isStrict: boolean = false // Mode strict (uniquement documents fournis)
patientContext?: Patient // Contexte patiente (optionnel)
fileData?: FileData // Fichier PDF en base64 (optionnel)
```

**FileData format** :
```typescript
{
  inlineData: {
    data: string, // Base64
    mimeType: string // "application/pdf"
  }
}
```

**System Instructions** :

**Mode Normal** (`isStrict = false`) :
```
Tu es un assistant médical spécialisé pour les sages-femmes libérales en France.
Réponds de manière professionnelle, concise et en français.
[Si customProtocol] Utilise ce protocole comme source prioritaire : ...
[Si fileData] Analyse également le fichier PDF fourni...
```

**Mode Strict** (`isStrict = true`) :
```
Tu es un assistant strict basé EXCLUSIVEMENT sur [les documents fournis].
TES RÈGLES :
1. Tu ne dois utiliser QUE les informations contenues dans les documents fournis.
2. Si la réponse n'est pas dans les documents, réponds : "Désolé, cette information ne figure pas dans les documents fournis."
3. N'utilise aucune connaissance externe.
4. Cite les parties des documents pour justifier ta réponse.
[Si customProtocol et pas de PDF] PROTOCOLE DE RÉFÉRENCE : ...
```

**Température** :
- Mode strict : 0.1 (très déterministe)
- Mode normal : 0.7 (équilibré)

**Contexte patiente** (si fourni) :
```
Contexte patiente: [Prénom] [Nom], [Statut].
Dernière visite: [Date].
```

**Retour** : Texte formaté

---

#### 3. summarizePatientHistory
**Usage** : Résumé du dossier patient pour transmission.

**Paramètres** :
```typescript
patient: Patient
```

**System Instruction** :
```
Tu es une sage-femme. Fais un résumé synthétique des points clés,
antécédents et points de vigilance.
```

**Prompt** :
```
Résume le dossier de cette patiente pour une transmission: [JSON complet du patient]
```

**Note** : Cette fonction existe dans le code mais n'est pas utilisée dans l'interface actuelle.

---

## 🔄 Flux Utilisateur (User Flow)

### 1. Démarrage de l'application

```
1. Chargement App.tsx
   ↓
2. Lecture LocalStorage
   - Clé 'sf-patients' → Liste des patientes
   - Clé 'sf-tasks' → Liste des tâches
   ↓
3. Si vide → Chargement MOCK_PATIENTS (2 patientes de démo)
   ↓
4. Affichage onglet "Patientèle" (par défaut)
   ↓
5. Rendu grille PatientCard
```

### 2. Recherche d'une patiente

```
1. Saisie dans barre de recherche (header, desktop uniquement)
   ↓
2. Filtrage en temps réel (searchTerm)
   ↓
3. Mise à jour de la grille (filteredPatients)
   ↓
4. Affichage : "[N] dossiers actifs"
```

### 3. Consultation d'un dossier patient

```
1. Clic sur PatientCard
   ↓
2. setSelectedPatientId(patient.id)
   ↓
3. Ouverture PatientDetails (modal plein écran)
   ↓
4. Affichage mode 'view' :
   - Header avec identité
   - Zone mémo (rappels prochaine consultation)
   - État de suivi (DPA, G/P, etc.)
   - Dossier médical (6 sections)
   - Historique des visites
   ↓
5. Fermeture : clic X ou bouton fermer
   → setSelectedPatientId(null)
```

### 4. Édition inline d'un champ

```
1. Survol d'un champ éditable
   ↓
2. Affichage icône Edit3 + bordure rose au hover
   ↓
3. Clic sur le champ
   ↓
4. Transformation en input/textarea
   - Focus automatique
   - Bordure rose-200
   - Ring rose-50
   ↓
5. Modification du contenu
   ↓
6. Perte de focus (onBlur)
   ↓
7. Sauvegarde automatique :
   - updateField(path, value)
   - Mise à jour immutabilité (JSON parse/stringify)
   - onUpdatePatient(updatedPatient)
   ↓
8. Propagation App.tsx :
   - setPatients (map + remplacement)
   - useEffect → localStorage.setItem('sf-patients', ...)
```

### 5. Analyse IA rapide (double-clic)

```
1. Double-clic sur n'importe quel champ éditable
   ↓
2. handleQuickInsight(term)
   - term = contenu du champ cliqué
   ↓
3. Affichage overlay IA (z-index 70)
   - Header : "Analyse IA" + sujet
   - Loading : spinner + "Consultation IA..."
   ↓
4. Appel getQuickClinicalInsight(term, patient)
   - Context : nom, prénom, statut
   - Temperature : 0.2
   ↓
5. Réception réponse
   ↓
6. Affichage résultat :
   - Fond rose clair
   - Texte formaté (tirets)
   - Points de vigilance, examens, conseils
   ↓
7. Clic "OK" → Fermeture overlay
```

### 6. Ajout d'une nouvelle consultation

```
1. Clic "NOUVELLE CONSULTATION" (PatientDetails, mode view)
   ↓
2. setMode('addVisit')
   ↓
3. Affichage formulaire de consultation :
   - Sélection motif (5 templates)
   - Date + type
   - Paramètres cliniques (selon template)
   - Observations
   ↓
4. Sélection d'un template
   ↓
5. setSelectedTemplate(motif)
   ↓
6. useEffect → Mise à jour newVisit :
   - type = template
   - notes = notes par défaut du template
   ↓
7. Saisie des mesures cliniques
   ↓
8. onChange → setNewVisit (merge measurements)
   ↓
9. Saisie observations (textarea)
   ↓
10. Clic "TERMINER"
   ↓
11. handleAddVisit() :
    - Création Visit avec id = timestamp
    - Ajout en tête de history
    - Mise à jour lastVisit
    - onUpdatePatient(updatedPatient)
   ↓
12. setMode('view')
   ↓
13. Affichage historique mis à jour
   ↓
14. Propagation App.tsx → LocalStorage
```

### 7. Création d'une nouvelle patiente

```
1. Clic "Nouvelle Patiente" (header)
   ↓
2. setIsAddingPatient(true)
   ↓
3. Affichage AddPatientModal
   ↓
4. Saisie formulaire :
   - Prénom, Nom (required)
   - Date de naissance (required)
   - Téléphone (required)
   - Email
   - Statut (select)
   ↓
5. Submit formulaire
   ↓
6. handleAddPatient(newPatient) :
   - id = timestamp
   - lastVisit = aujourd'hui
   - nextAppointment = aujourd'hui + 7 jours
   - medicalHistory = vide
   - history = []
   ↓
7. setPatients([...prev, newPatient])
   ↓
8. onClose() → setIsAddingPatient(false)
   ↓
9. Affichage nouvelle PatientCard dans la grille
   ↓
10. useEffect → localStorage.setItem('sf-patients', ...)
```

### 8. Navigation Calendrier

```
1. Clic onglet "Calendrier"
   ↓
2. setActiveTab('calendar')
   ↓
3. Génération mockAppointments (useMemo) :
   - Pour chaque patient :
     - id = "app-{patient.id}"
     - date = nextAppointment du patient
     - time = alterné (09:00 ou 14:30)
     - type = selon statut patient (Gynéco/Écho/Obstétrique)
   ↓
4. Affichage CalendarView(appointments)
   ↓
5. Calcul calendrier :
   - Mois en cours (currentDate)
   - Jours du mois
   - Offset pour alignement lundi
   ↓
6. Rendu grille 7×N :
   - Pour chaque jour : getAppointmentsForDay(day)
   - Filtrage appointments par date
   - Affichage badges colorés (type)
   ↓
7. Navigation :
   - Clic ChevronLeft → prevMonth()
   - Clic "Aujourd'hui" → setCurrentDate(new Date())
   - Clic ChevronRight → nextMonth()
```

### 9. Consultation Assistant IA

```
1. Clic onglet "Assistant IA"
   ↓
2. setActiveTab('ai')
   ↓
3. Affichage interface IA :
   - Zone protocole (collapsible)
   - Textarea question
   - Zone réponse
   ↓
4. (Optionnel) Configuration protocole :
   a. Clic "Documents de référence"
      → setShowProtocolEditor(true)
   b. Saisie texte protocole (textarea)
      → setProtocolText(...)
   c. OU Upload PDF :
      - Clic zone upload → open file picker
      - Sélection PDF
      - handleFileChange(e)
      - Lecture FileReader
      - Conversion base64
      - setAttachedFile({name, data: {inlineData: {data, mimeType}}})
   ↓
5. Saisie question (aiPrompt)
   ↓
6. Submit formulaire
   ↓
7. handleAiConsult(e) :
   - setIsAiLoading(true)
   - setAiResponse('Consultation en cours...')
   ↓
8. Appel getAIAdvisorResponse(
     aiPrompt,
     protocolText,
     isStrictEnabled,
     selectedPatient,
     attachedFile?.data
   )
   - Context patient si selectedPatient défini
   - Protocol si protocolText défini
   - PDF si attachedFile défini
   - Temperature : 0.7 (ou 0.1 si strict)
   ↓
9. Réception réponse
   ↓
10. setAiResponse(res)
    setIsAiLoading(false)
   ↓
11. Affichage réponse :
    - Fond blanc
    - Prose formatée
    - Texte pré-formaté (whitespace-pre-wrap)
```

### 10. Gestion du Bloc-notes

```
1. Clic bouton flottant (icône StickyNote, bottom-right)
   ↓
2. setShowTasks(true)
   ↓
3. Affichage panel tâches :
   - Liste des tâches existantes
   - Sélecteur de couleur (5 couleurs)
   - Input + bouton ajout
   ↓
4. Ajout d'une tâche :
   a. Saisie texte (newTaskText)
   b. Sélection couleur (clic pastille)
      → setSelectedTaskColor(color.class)
   c. Submit formulaire
      → addTask(e)
   d. setTasks([...tasks, {id, text, completed: false, color}])
   e. setNewTaskText('')
   ↓
5. Toggle tâche :
   - Clic icône Circle/CheckCircle2
   → toggleTask(id)
   → setTasks(map : completed = !completed)
   ↓
6. Suppression tâche :
   - Clic icône Trash2 (visible au hover)
   → deleteTask(id)
   → setTasks(filter : id !== id)
   ↓
7. Fermeture panel :
   - Clic X (header) OU bouton flottant
   → setShowTasks(false)
   ↓
8. useEffect → localStorage.setItem('sf-tasks', ...)
```

---

## 💾 Persistance des Données

### LocalStorage

**Clés utilisées** :
1. **'sf-patients'** : Liste complète des patientes (JSON)
2. **'sf-tasks'** : Liste des tâches du bloc-notes (JSON)

**Initialisation** :
```typescript
// Patients
const [patients, setPatients] = useState<Patient[]>(() => {
  const saved = localStorage.getItem('sf-patients');
  return saved ? JSON.parse(saved) : MOCK_PATIENTS;
});

// Tasks
const [tasks, setTasks] = useState<Task[]>(() => {
  const saved = localStorage.getItem('sf-tasks');
  return saved ? JSON.parse(saved) : [];
});
```

**Synchronisation** :
```typescript
// Patients
useEffect(() => {
  localStorage.setItem('sf-patients', JSON.stringify(patients));
}, [patients]);

// Tasks
useEffect(() => {
  localStorage.setItem('sf-tasks', JSON.stringify(tasks));
}, [tasks]);
```

**Note** : Aucune synchronisation serveur. Données stockées localement dans le navigateur.

---

## 🎯 Fonctionnalités Clés

### 1. Édition Inline Universelle
- **Où** : Tous les champs du dossier patient
- **Comment** : Clic sur le champ → input/textarea
- **Sauvegarde** : Automatique à la perte de focus (onBlur)
- **Feedback** : Bordure rose + ring au focus

### 2. IA Contextuelle
- **Double-clic sur n'importe quel champ** → Analyse IA instantanée
- **Contexte automatique** : Nom, prénom, statut de la patiente
- **Réponses ciblées** : Vigilance, examens, conseils
- **Affichage** : Overlay modal avec loading

### 3. Templates de Consultation
- **5 templates prédéfinis** avec champs spécialisés
- **Adaptation automatique** : Champs cliniques selon le motif
- **Notes pré-remplies** : Modifiables
- **Historique** : Toutes les consultations enregistrées

### 4. Assistant IA Avancé
- **Support PDF** : Upload et analyse de documents
- **Protocoles personnalisés** : Texte libre
- **Mode strict** : Réponses uniquement basées sur les documents fournis
- **Contexte patient** : Intégration automatique si patiente sélectionnée

### 5. Calendrier Intelligent
- **Vue mensuelle** classique
- **Génération automatique** des rendez-vous depuis nextAppointment
- **Codage couleur** par type (Gynéco, Obstétrique, Écho, Urgent)
- **Today highlight** : Jour actuel mis en valeur
- **Navigation** : Mois précédent/suivant + retour aujourd'hui

### 6. Bloc-notes Coloré
- **Widget flottant** non intrusif
- **5 couleurs** pour catégoriser les tâches
- **Checkbox** : Marquer comme complété
- **Persistance** : LocalStorage
- **Animation** : Slide-in fluide

### 7. Responsive Mobile
- **Sidebar → Navigation flottante** en bas d'écran
- **Recherche masquée** sur mobile (à améliorer)
- **Touch-friendly** : Grandes zones de clic
- **Padding adapté** pour ne pas masquer le contenu

---

## 🚀 Améliorations Possibles (Nice to Have)

### UX/UI
1. **Recherche mobile** : Afficher la barre de recherche sur mobile
2. **Notifications** : Badge rouge fonctionnel avec rappels RDV
3. **Tri & filtres** : Trier par statut, date RDV, nom
4. **Vue liste** : Alternative à la grille de cartes
5. **Dark mode** : Thème sombre
6. **Accessibilité** : ARIA labels, navigation clavier
7. **Animations** : Plus de micro-interactions
8. **Drag & drop** : Réorganiser les tâches du bloc-notes
9. **Export PDF** : Générer un dossier patient en PDF
10. **Impression** : Feuille de consultation imprimable

### Fonctionnalités
1. **Vraie gestion de calendrier** :
   - Créer/modifier/supprimer des RDV
   - Créneaux horaires définis
   - Durée variable selon le type
   - Rappels automatiques (email/SMS)
   - Synchronisation avec Google Calendar / Outlook

2. **Statistiques & Reporting** :
   - Nombre de consultations par type
   - Graphiques de suivi (poids, TA, etc.)
   - Tableau de bord mensuel
   - Export Excel/CSV

3. **Collaboration** :
   - Partage de dossier avec confrères
   - Notes partagées
   - Historique de modifications

4. **Documents** :
   - Upload de documents (ordonnances, résultats d'examen)
   - Galerie d'images (échographies)
   - Signature électronique

5. **Facturation** :
   - Génération de factures
   - Suivi des paiements
   - Export comptable

6. **Templates personnalisés** :
   - Créer ses propres templates de consultation
   - Bibliothèque de protocoles
   - Macros de texte

7. **Synchronisation multi-device** :
   - Backend avec base de données
   - API REST
   - Authentification sécurisée
   - Sync temps réel

8. **IA Avancée** :
   - Détection automatique de risques (croisement ATCD)
   - Suggestions de protocoles
   - Prédiction de complications
   - Résumé automatique de consultation
   - Transcription vocale → notes

9. **Conformité RGPD** :
   - Chiffrement des données
   - Consentement patient
   - Droit à l'oubli
   - Export de données
   - Logs d'accès

10. **Intégrations** :
    - CPAM / SESAM Vitale
    - Laboratoires d'analyse
    - Hôpitaux / maternités
    - Messagerie sécurisée (MSSanté)

### Performance
1. **Optimisation** :
   - Code splitting
   - Lazy loading des composants
   - Memoization (React.memo, useMemo, useCallback)
   - Virtual scrolling (listes longues)

2. **SEO & PWA** :
   - Progressive Web App (offline mode)
   - Service Worker
   - Manifest
   - Installation sur mobile

3. **Tests** :
   - Tests unitaires (Vitest)
   - Tests d'intégration (React Testing Library)
   - Tests E2E (Playwright)
   - CI/CD

---

## 🔐 Sécurité & Conformité

### Points d'attention actuels
1. **API Key exposée** :
   - Actuellement dans .env.local (non versionné)
   - ⚠️ Ne JAMAIS commit la clé Gemini
   - Solution : Backend proxy pour appels IA

2. **Données sensibles** :
   - LocalStorage non chiffré
   - ⚠️ Accessible via DevTools
   - Solution : Backend + authentification + chiffrement

3. **RGPD** :
   - Pas de consentement patient
   - Pas de traçabilité des accès
   - Pas de politique de confidentialité
   - Solution : Module de gestion RGPD complet

4. **Authentification** :
   - Aucune authentification actuellement
   - ⚠️ N'importe qui peut accéder à l'app
   - Solution : Login/password + 2FA

### Recommandations pour la production
1. **Backend sécurisé** (Node.js/Python) :
   - Authentification JWT
   - Base de données chiffrée (PostgreSQL + pg_crypto)
   - API sécurisée (HTTPS obligatoire)
   - Rate limiting
   - CORS configuré

2. **Hébergement certifié** :
   - HDS (Hébergeur de Données de Santé) en France
   - Conformité ISO 27001
   - Sauvegarde quotidienne
   - Plan de reprise d'activité

3. **Audit de sécurité** :
   - Pentesting
   - Revue de code
   - Conformité OWASP Top 10
   - Certification par un RSSI

---

## 📚 Glossaire Médical

### Abréviations utilisées
- **DPA** : Date Prévue d'Accouchement
- **DDR** : Date des Dernières Règles
- **RCF** : Rythme Cardiaque Fœtal
- **HU** : Hauteur Utérine
- **TA** : Tension Artérielle
- **G/P** : Gravidity / Parity (nombre de grossesses / accouchements)
- **ATCD** : Antécédents
- **EPDS** : Edinburgh Postnatal Depression Scale (échelle de dépression post-natale)
- **DIU** : Dispositif Intra-Utérin (stérilet)
- **Opro** : Contraception orale progestative
- **Implan** : Implant contraceptif

### Statuts de patiente
- **Prénatal** : Suivi de grossesse
- **Postnatal** : Suivi après accouchement
- **Gynécologie** : Consultation gynécologique (contraception, frottis, etc.)
- **Urgent** : Situation nécessitant une attention rapide

### Types de consultation
- **Obstétrique** : Suivi de grossesse
- **Gynécologie** : Examen gynécologique
- **Échographie** : Examen d'imagerie
- **Urgent** : Consultation en urgence

---

## 🎬 Conclusion

**MidwifeCare** est une application moderne, intuitive et puissante pour la gestion de patientèle des sages-femmes libérales. Son approche centrée sur l'UX, son design soigné et son intégration IA en font un outil **delightful** au quotidien.

### Points forts
✅ Interface magnifique (design rose/blanc très cohérent)
✅ Édition inline universelle (productivité maximale)
✅ IA contextuelle (aide à la décision instantanée)
✅ Templates de consultation (gain de temps)
✅ Bloc-notes coloré (organisation)
✅ Responsive mobile (mobilité)
✅ Persistance LocalStorage (simplicité)

### Axes d'amélioration pour la v2
🔧 Backend + authentification (sécurité)
🔧 Vraie gestion de calendrier (créer/modifier RDV)
🔧 Statistiques & reporting (analyse)
🔧 Upload de documents (dossier complet)
🔧 Facturation intégrée (gestion financière)
🔧 Conformité RGPD & HDS (production)
🔧 PWA offline (autonomie)
🔧 Tests automatisés (qualité)

**L'objectif de recréer une version "super méga chouette" est tout à fait atteignable en s'appuyant sur ces spécifications et en ajoutant progressivement les fonctionnalités avancées !** 🚀

---

*Document généré le 29/12/2025 par analyse approfondie du projet sage-femme-connect.*
