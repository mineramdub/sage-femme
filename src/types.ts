export enum PatientStatus {
  PRENATAL = 'Prénatal',
  POSTNATAL = 'Postnatal',
  GYNECO = 'Gynécologie',
  URGENT = 'Urgent'
}

export enum AppointmentType {
  GYNECO = 'Gynécologie',
  OBSTETRIQUE = 'Obstétrique',
  ECHO = 'Échographie',
  URGENT = 'Urgent'
}

export interface Visit {
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

export interface MedicalHistory {
  medical: string; // Antécédents médicaux
  surgical: string; // Antécédents chirurgicaux
  family: string; // Antécédents familiaux
  obstetrical: string; // Antécédents obstétricaux
  allergies: string; // Allergies
  treatments: string; // Traitements en cours
}

export interface Patient {
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

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Format: "NOM Prénom"
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:mm
  type: AppointmentType;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  color: string; // Classe CSS Tailwind
}

export interface FileData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}
