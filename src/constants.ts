import { Patient, PatientStatus } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dubois',
    birthDate: '1992-05-15',
    phone: '06 12 34 56 78',
    email: 'marie.dubois@email.com',
    status: PatientStatus.PRENATAL,
    lastVisit: '2024-12-15',
    nextAppointment: '2025-01-15',
    nextConsultationReminders: 'Vérifier le résultat du test O\'Sullivan. Discuter du projet de naissance.',
    pregnancyInfo: {
      ddr: '2024-06-20',
      dpa: '2025-03-27',
      gravidity: 1,
      parity: 0,
      bloodType: 'A+',
    },
    medicalHistory: {
      medical: 'Asthme léger, hypothyroïdie traitée.',
      surgical: 'Appendicectomie (2010).',
      family: 'Diabète de type 2 (mère), Hypertension (père).',
      obstetrical: 'Primipare.',
      allergies: 'Pénicilline.',
      treatments: 'Lévothyrox 50µg.'
    },
    history: [
      {
        id: 'v1',
        date: '2024-12-15',
        type: 'Suivi Mensuel Grossesse',
        notes: 'Évolution normale. Tension stable. Mouvements actifs fœtaux ressentis.',
        measurements: {
          weight: 68,
          bloodPressure: '120/80',
          fetalHeartRate: 145,
          uterineHeight: 28
        }
      },
      {
        id: 'v2',
        date: '2024-11-10',
        type: 'Suivi Mensuel Grossesse',
        notes: 'Tout se déroule bien. Échographie morphologique normale.',
        measurements: {
          weight: 65,
          bloodPressure: '118/78',
          fetalHeartRate: 142,
          uterineHeight: 24
        }
      }
    ]
  },
  {
    id: '2',
    firstName: 'Sophie',
    lastName: 'Martin',
    birthDate: '1988-10-22',
    phone: '06 98 76 54 32',
    email: 's.martin@email.com',
    status: PatientStatus.GYNECO,
    lastVisit: '2024-12-20',
    nextAppointment: '2025-01-20',
    nextConsultationReminders: 'Renouvellement contraception. Discussion frottis prévu.',
    lastSmearDate: '2022-03-12',
    medicalHistory: {
      medical: 'Aucun antécédent notable.',
      surgical: 'Aucun.',
      family: 'RAS.',
      obstetrical: 'G2 P2. Deux accouchements par voie basse.',
      allergies: 'Aucune connue.',
      treatments: 'Contraception orale (Optimizette).'
    },
    history: [
      {
        id: 'v3',
        date: '2024-12-20',
        type: 'Consultation Contraception',
        notes: 'Renouvellement pilule progestative. Pas d\'effet secondaire.',
        measurements: {
          weight: 62,
          bloodPressure: '115/75',
          heartRate: 72
        }
      }
    ]
  }
];

export const TASK_COLORS = [
  { name: 'Rose', class: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'Violet', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Vert', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Jaune', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Bleu', class: 'bg-sky-100 text-sky-700 border-sky-200' },
];

export const CONSULTATION_TEMPLATES = {
  'Suivi Mensuel Grossesse': {
    fields: ['Poids', 'TA', 'RCF', 'HU', 'Albumine/Sucre'],
    notes: 'Évolution normale. Bruits du cœur réguliers.'
  },
  'Consultation Contraception': {
    fields: ['TA', 'Poids', 'Pouls', 'Tabac', 'Glycémie', 'Triglycérides', 'ATCD Cardio'],
    notes: 'Explications contraception données (Opro, DIU, Implan). Bilan biologique prescrit (Glycémie, Cholestérol, Triglycérides).'
  },
  'Suivi Postnatal': {
    fields: ['TA', 'Poids', 'Cicatrisation', 'Allaitement', 'Moral/EPDS'],
    notes: 'Examen postnatal normal. Discussion périnée et contraception.'
  },
  'Gynécologie de prévention': {
    fields: ['TA', 'Poids', 'Dernier Frottis', 'Palpation Mammaire'],
    notes: 'Examen gynécologique de routine. Pas de douleur signalée.'
  },
  'Urgences / Autre': {
    fields: ['Motif', 'TA', 'Poids'],
    notes: ''
  }
};
