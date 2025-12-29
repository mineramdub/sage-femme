import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Patient, PatientStatus, Appointment, AppointmentType, Task, FileData } from './types';
import { MOCK_PATIENTS, TASK_COLORS } from './constants';
import PatientCard from './components/PatientCard';
import PatientDetails from './components/PatientDetails';
import CalendarView from './components/CalendarView';
import AddPatientModal from './components/AddPatientModal';
import {
  Search,
  Plus,
  Users,
  Calendar as CalendarIcon,
  Bot,
  Menu,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileUp,
  FileText,
  X,
  StickyNote,
  CheckCircle2,
  Circle,
  Check,
  UserPlus,
  Loader2,
  Trash2,
} from 'lucide-react';
import { getAIAdvisorResponse } from './services/geminiService';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('sf-patients');
    return saved ? JSON.parse(saved) : MOCK_PATIENTS;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'ai' | 'calendar'>('patients');
  const [isAddingPatient, setIsAddingPatient] = useState(false);

  const mockAppointments: Appointment[] = useMemo(() => {
    return patients.map((p, idx) => ({
      id: `app-${p.id}`,
      patientId: p.id,
      patientName: `${p.lastName.toUpperCase()} ${p.firstName}`,
      date: p.nextAppointment,
      time: idx % 2 === 0 ? '09:00' : '14:30',
      type:
        p.status === PatientStatus.GYNECO
          ? AppointmentType.GYNECO
          : idx % 3 === 0
          ? AppointmentType.ECHO
          : AppointmentType.OBSTETRIQUE,
    }));
  }, [patients]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [protocolText, setProtocolText] = useState('');
  const [isStrictEnabled] = useState(false);
  const [showProtocolEditor, setShowProtocolEditor] = useState(false);

  const [attachedFile, setAttachedFile] = useState<{ name: string; data: FileData } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('sf-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTasks, setShowTasks] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTaskColor, setSelectedTaskColor] = useState(TASK_COLORS[0].class);

  useEffect(() => {
    localStorage.setItem('sf-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('sf-patients', JSON.stringify(patients));
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const selectedPatient = useMemo(() => patients.find((p) => p.id === selectedPatientId), [patients, selectedPatientId]);

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [...prev, newPatient]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      setAttachedFile({
        name: file.name,
        data: {
          inlineData: { data: base64Data, mimeType: file.type },
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse('Consultation en cours...');
    const res = await getAIAdvisorResponse(
      aiPrompt,
      protocolText,
      isStrictEnabled,
      selectedPatient || undefined,
      attachedFile?.data
    );
    setAiResponse(res || 'Une erreur est survenue.');
    setIsAiLoading(false);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText, completed: false, color: selectedTaskColor }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const deleteTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-rose-50/30 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-rose-100 h-screen sticky top-0 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
            <Plus size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            MidwifeCare
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'patients' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-500 hover:bg-rose-50'
            }`}
          >
            <Users size={20} /> Patientèle
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'calendar' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-500 hover:bg-rose-50'
            }`}
          >
            <CalendarIcon size={20} /> Calendrier
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'ai' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-500 hover:bg-rose-50'
            }`}
          >
            <Bot size={20} /> Assistant IA
          </button>
        </nav>

        <div className="pt-6 border-t border-rose-100 mt-auto">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
              SF
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Mme. Dupont</p>
              <p className="text-xs text-slate-500">Sage-femme libérale</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden pb-20 md:pb-0 relative">
        <header className="bg-white border-b border-rose-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 md:hidden">
            <Menu className="text-slate-600" />
            <h1 className="text-lg font-bold text-rose-600">MidwifeCare</h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une patiente..."
                className="w-full pl-10 pr-4 py-2 bg-rose-50/50 border border-transparent rounded-xl focus:border-rose-200 focus:ring-0 text-sm outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:bg-rose-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button
              onClick={() => setIsAddingPatient(true)}
              className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100 active:scale-95"
            >
              <UserPlus size={18} /> Nouvelle Patiente
            </button>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'patients' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ma Patientèle</h2>
                <p className="text-slate-500 font-medium">{filteredPatients.length} dossiers actifs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPatients.map((p) => (
                  <PatientCard key={p.id} patient={p} onClick={(id) => setSelectedPatientId(id)} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda Clinique</h2>
                <p className="text-slate-500 font-medium">Gestion des rendez-vous et échographies</p>
              </div>
              <CalendarView appointments={mockAppointments} />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Bot size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Assistant Expert</h2>
                <p className="text-slate-500 font-medium">Analyse clinique et protocoles de soin intelligents.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden">
                <button
                  onClick={() => setShowProtocolEditor(!showProtocolEditor)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-rose-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={20} className="text-rose-600" />
                    <span className="font-bold text-slate-700">
                      Documents de référence {protocolText || attachedFile ? '(Configuré)' : '(Optionnel)'}
                    </span>
                  </div>
                  {showProtocolEditor ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showProtocolEditor && (
                  <div className="px-6 pb-6 pt-2 space-y-4 border-t border-rose-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Texte du protocole</label>
                        <textarea
                          value={protocolText}
                          onChange={(e) => setProtocolText(e.target.value)}
                          placeholder="Protocole spécifique..."
                          className="w-full h-32 p-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:ring-2 focus:ring-rose-200 text-sm resize-none outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fichier PDF</label>
                        <div
                          onClick={() => !attachedFile && fileInputRef.current?.click()}
                          className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                            attachedFile
                              ? 'border-rose-200 bg-rose-50/50'
                              : 'border-slate-200 hover:border-rose-300 cursor-pointer bg-slate-50/50'
                          }`}
                        >
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                          {attachedFile ? (
                            <div className="px-4 text-center">
                              <FileText className="text-rose-600 mx-auto mb-1" size={24} />
                              <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{attachedFile.name}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAttachedFile(null);
                                }}
                                className="mt-2 text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-1 mx-auto"
                              >
                                <X size={10} /> Supprimer
                              </button>
                            </div>
                          ) : (
                            <>
                              <FileUp className="text-slate-400" size={24} />
                              <p className="text-xs text-slate-500 font-bold">Importer un PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleAiConsult} className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Posez votre question clinique ici..."
                  className="w-full h-24 p-4 bg-rose-50/30 border-none rounded-2xl focus:ring-2 focus:ring-rose-200 resize-none mb-4 outline-none"
                />
                <div className="flex justify-end">
                  <button
                    disabled={isAiLoading}
                    className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-rose-100"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />} Consulter l'IA
                  </button>
                </div>
              </form>

              {(aiResponse || isAiLoading) && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-rose-100">
                  <div className="prose prose-rose max-w-none text-slate-700 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Tasks Widget */}
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end">
          {showTasks && (
            <div className="bg-white w-72 md:w-80 rounded-3xl shadow-2xl border border-rose-100 mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="bg-rose-600 p-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-2 font-bold">
                  <StickyNote size={18} /> Bloc-notes
                </div>
                <button onClick={() => setShowTasks(false)} className="hover:bg-white/20 p-1 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between group p-2.5 rounded-xl border-l-4 transition-all ${task.color}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`transition-colors ${task.completed ? 'opacity-50' : 'hover:scale-110'}`}
                      >
                        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <span
                        className={`text-sm flex-1 leading-tight ${
                          task.completed ? 'opacity-50 line-through' : 'font-semibold'
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded-lg transition-all"
                    >
                      <Trash2 size={14} className="text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-rose-50 bg-rose-50/20 space-y-3">
                <div className="flex justify-center gap-2">
                  {TASK_COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTaskColor(c.class)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${c.class.split(' ')[0]} ${
                        selectedTaskColor === c.class ? 'border-slate-800 scale-125' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
                <form onSubmit={addTask} className="relative">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Note..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-rose-100 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-rose-600 text-white p-1.5 rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </form>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowTasks(!showTasks)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
              showTasks
                ? 'bg-white text-rose-600 rotate-90 scale-90'
                : 'bg-rose-600 text-white hover:scale-110 shadow-rose-200/50'
            }`}
          >
            {showTasks ? <X size={28} /> : <StickyNote size={28} />}
          </button>
        </div>
      </main>

      {/* Floating Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 px-6 py-3 flex justify-between items-center z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('patients')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'patients' ? 'text-rose-600' : 'text-slate-400'}`}
        >
          <Users size={24} />
          <span className="text-[10px] font-bold">Patientèle</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-rose-600' : 'text-slate-400'}`}
        >
          <CalendarIcon size={24} />
          <span className="text-[10px] font-bold">Agenda</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'text-rose-600' : 'text-slate-400'}`}
        >
          <Bot size={24} />
          <span className="text-[10px] font-bold">Assistant</span>
        </button>
      </nav>

      {/* Modals */}
      {isAddingPatient && <AddPatientModal onClose={() => setIsAddingPatient(false)} onAdd={handleAddPatient} />}
      {selectedPatient && (
        <PatientDetails patient={selectedPatient} onClose={() => setSelectedPatientId(null)} onUpdatePatient={handleUpdatePatient} />
      )}
    </div>
  );
};

export default App;
