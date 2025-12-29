import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { X, Save, UserPlus } from 'lucide-react';

interface AddPatientModalProps {
  onClose: () => void;
  onAdd: (patient: Patient) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
    status: PatientStatus.PRENATAL,
    nextConsultationReminders: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newPatient: Patient = {
      ...formData,
      id: Date.now().toString(),
      lastVisit: today,
      nextAppointment: nextWeek,
      medicalHistory: {
        medical: '',
        surgical: '',
        family: '',
        obstetrical: '',
        allergies: '',
        treatments: '',
      },
      history: [],
    } as Patient;

    onAdd(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-rose-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserPlus size={24} />
            <h2 className="text-xl font-bold">Nouvelle Patiente</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
              <input
                required
                type="text"
                className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</label>
              <input
                required
                type="text"
                className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date de naissance</label>
            <input
              required
              type="date"
              className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</label>
            <input
              required
              type="tel"
              className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</label>
            <select
              className="w-full p-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-200 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
            >
              {Object.values(PatientStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-lg shadow-rose-100"
            >
              <Save size={18} /> Créer la fiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
