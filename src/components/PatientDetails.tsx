import React, { useState, useEffect } from 'react';
import { Patient, Visit, PatientStatus } from '../types';
import {
  Activity,
  History,
  Stethoscope,
  Scissors,
  Users2,
  AlertCircle,
  Pill,
  Baby,
  Edit3,
  PlusCircle,
  X,
  Pin,
  ClipboardList,
  Zap,
  Loader2,
  Check,
} from 'lucide-react';
import { getQuickClinicalInsight } from '../services/geminiService';
import { CONSULTATION_TEMPLATES } from '../constants';

interface PatientDetailsProps {
  patient: Patient;
  onClose: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

type ViewMode = 'view' | 'addVisit';

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, onClose, onUpdatePatient }) => {
  const [mode, setMode] = useState<ViewMode>('view');
  const [insight, setInsight] = useState<{ term: string; content: string } | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof CONSULTATION_TEMPLATES>('Urgences / Autre');
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Urgences / Autre',
    notes: '',
    measurements: { weight: 0, bloodPressure: '', fetalHeartRate: 0, heartRate: 0, glucose: 0, triglycerides: 0 },
  });

  useEffect(() => {
    setNewVisit((prev) => ({
      ...prev,
      type: selectedTemplate,
      notes: prev.notes || CONSULTATION_TEMPLATES[selectedTemplate].notes,
    }));
  }, [selectedTemplate]);

  const handleQuickInsight = async (term: string) => {
    if (!term || mode !== 'view') return;
    setIsInsightLoading(true);
    setInsight({ term, content: '' });
    const content = await getQuickClinicalInsight(term, patient);
    setInsight({ term, content: content || 'Aucun conseil disponible.' });
    setIsInsightLoading(false);
  };

  const updateField = (path: string, value: any) => {
    const updatedPatient = JSON.parse(JSON.stringify(patient));
    const keys = path.split('.');
    let current: any = updatedPatient;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdatePatient(updatedPatient);
  };

  const handleAddVisit = () => {
    const visit: Visit = { ...newVisit, id: Date.now().toString() } as Visit;
    const updatedPatient = { ...patient, history: [visit, ...patient.history], lastVisit: visit.date };
    onUpdatePatient(updatedPatient);
    setMode('view');
  };

  const EditableText = ({ path, value, isTextArea = false, className = '', label = '' }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => setLocalValue(value), [value]);

    const handleBlur = () => {
      setIsEditing(false);
      if (localValue !== value) updateField(path, localValue);
    };

    if (isEditing) {
      return isTextArea ? (
        <textarea
          autoFocus
          className={`w-full p-2 border border-rose-200 rounded-xl outline-none focus:ring-4 focus:ring-rose-50 font-medium ${className}`}
          value={localValue}
          onBlur={handleBlur}
          onChange={(e) => setLocalValue(e.target.value)}
        />
      ) : (
        <input
          autoFocus
          className={`w-full p-2 border border-rose-200 rounded-xl outline-none focus:ring-4 focus:ring-rose-50 font-bold ${className}`}
          value={localValue}
          onBlur={handleBlur}
          onChange={(e) => setLocalValue(e.target.value)}
        />
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer hover:bg-rose-50/70 p-1.5 rounded-xl transition-all group relative border border-transparent hover:border-rose-100 ${className}`}
      >
        <span className={!value ? 'text-slate-300 italic' : 'text-slate-700'}>{value || `Ajouter ${label}`}</span>
        <Edit3 size={12} className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 text-rose-500" />
      </div>
    );
  };

  const HistorySection = ({ icon: Icon, title, content, path, colorClass }: any) => (
    <div
      onDoubleClick={() => handleQuickInsight(content)}
      className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm hover:border-rose-200 transition-all group relative cursor-help"
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
        <Zap size={14} className="text-rose-400" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={colorClass} />
        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-widest">{title}</h4>
      </div>
      <EditableText path={path} value={content} isTextArea label={title} className="text-sm font-medium leading-relaxed" />
      {mode === 'view' && (
        <p className="text-[10px] text-slate-300 mt-3 font-bold italic group-hover:text-rose-400 uppercase tracking-tighter transition-colors">
          Double-clic : IA
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative border border-rose-100">
        {/* AI Insight Overlay */}
        {insight && (
          <div className="absolute inset-0 bg-white/98 z-[70] flex flex-col p-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Analyse IA</h3>
                  <p className="text-sm font-bold text-rose-600 uppercase tracking-widest">Sujet : {insight.term}</p>
                </div>
              </div>
              <button onClick={() => setInsight(null)} className="p-3 hover:bg-rose-50 rounded-full transition-colors text-slate-400">
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-4">
              {isInsightLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6">
                  <Loader2 className="animate-spin text-rose-600" size={48} />
                  <p className="font-black text-xl uppercase tracking-widest">Consultation IA...</p>
                </div>
              ) : (
                <div className="prose prose-rose max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap bg-rose-50/20 p-8 rounded-[2rem] border border-rose-50 shadow-inner">
                  {insight.content}
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setInsight(null)}
                className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 active:scale-95 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className={`p-8 border-b flex justify-between items-center ${
            patient.status === PatientStatus.GYNECO ? 'bg-purple-50/50' : 'bg-rose-50/50'
          }`}
        >
          <div className="flex items-center gap-6">
            <div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl ${
                patient.status === PatientStatus.GYNECO
                  ? 'bg-purple-600 shadow-purple-200'
                  : 'bg-rose-600 shadow-rose-200'
              }`}
            >
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center">
                  <EditableText path="firstName" value={patient.firstName} label="Prénom" />
                  <span className="w-2"></span>
                  <EditableText path="lastName" value={patient.lastName} label="Nom" />
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                    patient.status === PatientStatus.GYNECO
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-4">
                <span>
                  Née le <EditableText path="birthDate" value={patient.birthDate} label="Date de naissance" className="inline-block" />
                </span>
                <span className="text-rose-200">•</span>
                <span>{patient.email}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'view' && (
              <button
                onClick={() => setMode('addVisit')}
                className="flex items-center gap-2 px-6 py-4 bg-rose-600 text-white rounded-2xl text-sm font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95"
              >
                <PlusCircle size={20} /> NOUVELLE CONSULTATION
              </button>
            )}
            <button onClick={onClose} className="p-3 hover:bg-rose-100 rounded-full text-slate-400 transition-colors ml-4">
              <X size={32} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-rose-50/10">
          {/* Memo Note */}
          {mode === 'view' && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Pin size={80} className="text-amber-600 -rotate-12" />
              </div>
              <h3 className="text-amber-800 font-black flex items-center gap-2 mb-4 text-[10px] uppercase tracking-[0.3em]">
                <Pin size={16} /> Mémo Prochaine Séance
              </h3>
              <EditableText
                path="nextConsultationReminders"
                value={patient.nextConsultationReminders}
                isTextArea
                label="Rappels"
                className="text-amber-900 font-bold italic leading-relaxed text-xl"
              />
            </div>
          )}

          {mode === 'addVisit' ? (
            /* Add Visit Mode */
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm border border-rose-100 space-y-10 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                  <PlusCircle size={32} className="text-rose-600" /> Commencer une séance
                </h3>
                <button onClick={() => setMode('view')} className="text-slate-400 hover:text-slate-600 p-2">
                  <X size={28} />
                </button>
              </div>

              {/* Template Selection */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] block">Motif principal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(CONSULTATION_TEMPLATES).map((motif) => (
                    <button
                      key={motif}
                      onClick={() => setSelectedTemplate(motif as any)}
                      className={`p-6 rounded-[1.5rem] border-2 text-sm font-black text-left transition-all ${
                        selectedTemplate === motif
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xl shadow-rose-100 scale-105'
                          : 'bg-white text-slate-500 border-rose-50 hover:border-rose-100'
                      }`}
                    >
                      {motif}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8 pt-10 border-t-2 border-rose-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date séance</label>
                    <input
                      type="date"
                      className="w-full p-5 bg-rose-50/30 border-none rounded-[1.2rem] font-bold outline-none text-slate-700"
                      value={newVisit.date}
                      onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type exact</label>
                    <input
                      type="text"
                      className="w-full p-5 bg-rose-50/30 border-none rounded-[1.2rem] font-bold outline-none text-slate-700"
                      value={newVisit.type}
                      onChange={(e) => setNewVisit({ ...newVisit, type: e.target.value })}
                    />
                  </div>
                </div>

                {/* Clinical Parameters */}
                <div className="bg-rose-50/20 p-8 rounded-[2.5rem] border-2 border-rose-50">
                  <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Activity size={16} /> Paramètres cliniques ({selectedTemplate})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {CONSULTATION_TEMPLATES[selectedTemplate].fields.map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{field}</label>
                        <input
                          type="text"
                          placeholder="..."
                          className="w-full p-4 bg-white border-2 border-rose-50 rounded-[1.2rem] font-black text-sm outline-none focus:border-rose-200 transition-all text-slate-700"
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewVisit((prev) => ({
                              ...prev,
                              measurements: {
                                ...prev.measurements,
                                [field.toLowerCase().includes('poids')
                                  ? 'weight'
                                  : field.toLowerCase().includes('ta')
                                  ? 'bloodPressure'
                                  : field.toLowerCase().includes('pouls')
                                  ? 'heartRate'
                                  : field.toLowerCase().includes('glycémie')
                                  ? 'glucose'
                                  : field.toLowerCase().includes('triglycérides')
                                  ? 'triglycerides'
                                  : 'other']: val,
                              },
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Observations détaillées</label>
                  <textarea
                    className="w-full p-6 bg-rose-50/30 border-none rounded-[2rem] h-40 font-medium outline-none text-slate-700 leading-relaxed"
                    placeholder="Saisissez vos notes cliniques..."
                    value={newVisit.notes}
                    onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-6 pt-6">
                <button
                  onClick={() => setMode('view')}
                  className="px-10 py-4 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-400 hover:bg-slate-50 transition-all"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleAddVisit}
                  className="px-10 py-4 bg-rose-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-rose-100 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Check size={24} /> TERMINER
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Patient Status */}
              <div
                onDoubleClick={() => handleQuickInsight(patient.status)}
                className={`lg:col-span-4 bg-white p-10 rounded-[2.5rem] border shadow-sm cursor-help hover:border-rose-200 transition-all group relative ${
                  patient.status === PatientStatus.GYNECO
                    ? 'border-purple-100 shadow-purple-50'
                    : 'border-rose-100 shadow-rose-50'
                }`}
              >
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-40 transition-opacity">
                  <Zap size={24} className="text-rose-400" />
                </div>
                <h3 className="font-black text-slate-800 flex items-center gap-3 mb-10 uppercase tracking-[0.2em] text-xs">
                  <Activity
                    size={20}
                    className={patient.status === PatientStatus.GYNECO ? 'text-purple-600' : 'text-rose-600'}
                  />{' '}
                  État de Suivi (Clic pour éditer)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Catégorie</p>
                    <p
                      className={`text-2xl font-black ${
                        patient.status === PatientStatus.GYNECO ? 'text-purple-700' : 'text-rose-700'
                      }`}
                    >
                      {patient.status}
                    </p>
                  </div>
                  {patient.pregnancyInfo && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">DPA estimée</p>
                        <EditableText
                          path="pregnancyInfo.dpa"
                          value={patient.pregnancyInfo.dpa}
                          label="DPA"
                          className="text-2xl font-black text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">G / P</p>
                        <div className="flex items-center gap-2 text-2xl font-black text-slate-800">
                          G
                          <EditableText
                            path="pregnancyInfo.gravidity"
                            value={patient.pregnancyInfo.gravidity}
                            label="G"
                            className="inline-block"
                          />
                          P
                          <EditableText
                            path="pregnancyInfo.parity"
                            value={patient.pregnancyInfo.parity}
                            label="P"
                            className="inline-block"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-8">
                <h3 className="flex items-center gap-3 text-slate-800 font-black uppercase tracking-[0.2em] text-xs">
                  <Stethoscope
                    size={24}
                    className={patient.status === PatientStatus.GYNECO ? 'text-purple-600' : 'text-rose-600'}
                  />{' '}
                  Dossier Médical & Antécédents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <HistorySection
                    icon={Stethoscope}
                    title="Médicaux"
                    content={patient.medicalHistory.medical}
                    path="medicalHistory.medical"
                    colorClass="text-sky-500"
                  />
                  <HistorySection
                    icon={Scissors}
                    title="Chirurgicaux"
                    content={patient.medicalHistory.surgical}
                    path="medicalHistory.surgical"
                    colorClass="text-slate-500"
                  />
                  <HistorySection
                    icon={Users2}
                    title="Familiaux"
                    content={patient.medicalHistory.family}
                    path="medicalHistory.family"
                    colorClass="text-emerald-500"
                  />
                  <HistorySection
                    icon={Baby}
                    title="Obstétricaux"
                    content={patient.medicalHistory.obstetrical}
                    path="medicalHistory.obstetrical"
                    colorClass="text-purple-500"
                  />
                  <HistorySection
                    icon={Pill}
                    title="Traitements"
                    content={patient.medicalHistory.treatments}
                    path="medicalHistory.treatments"
                    colorClass="text-rose-500"
                  />
                  <div
                    onDoubleClick={() => handleQuickInsight('Allergies: ' + patient.medicalHistory.allergies)}
                    className="bg-red-50 p-8 rounded-[2rem] border border-red-100 shadow-sm cursor-help hover:border-red-200 transition-all group relative"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle size={20} className="text-red-500" />
                      <h4 className="font-bold text-red-700 text-xs uppercase tracking-widest">Allergies</h4>
                    </div>
                    <EditableText
                      path="medicalHistory.allergies"
                      value={patient.medicalHistory.allergies}
                      isTextArea
                      label="Allergies"
                      className="text-sm text-red-800 font-black leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Visit History */}
              <div className="pb-8">
                <h3 className="flex items-center gap-3 text-slate-800 font-black uppercase tracking-[0.2em] text-xs">
                  <History
                    size={24}
                    className={patient.status === PatientStatus.GYNECO ? 'text-purple-600' : 'text-rose-600'}
                  />{' '}
                  Historique des Visites
                </h3>
                <div className="bg-white rounded-[2.5rem] border border-rose-50 overflow-hidden divide-y divide-rose-50 mt-6">
                  {patient.history.length === 0 ? (
                    <div className="p-16 text-center">
                      <p className="text-slate-400 italic font-bold text-lg">Aucun historique disponible.</p>
                    </div>
                  ) : (
                    patient.history.map((v) => (
                      <div key={v.id} className="p-8 hover:bg-rose-50/20 transition-all flex items-start gap-6 group">
                        <div className="bg-rose-100 p-4 rounded-[1.2rem] text-rose-600 group-hover:scale-110 transition-transform">
                          <ClipboardList size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-slate-800 text-xl tracking-tight">{v.type}</h4>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                              {new Date(v.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </span>
                          </div>
                          <p className="mt-3 text-slate-500 font-medium italic leading-relaxed text-base">"{v.notes}"</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
