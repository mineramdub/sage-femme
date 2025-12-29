import React, { useState, useEffect, useRef } from 'react';
import { FileUp, FileText, Trash2, Loader2, Check, Search, X } from 'lucide-react';
import { Document } from '../types';
import { uploadDocument, listDocuments, deleteDocument } from '../services/documentService';

interface DocumentManagerProps {
  selectedDocIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ selectedDocIds, onSelectionChange }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
      setUploadError('Formats acceptés: PDF, TXT, MD');
      return;
    }

    setPendingFile(file);
    setNewDocName(file.name.replace(/\.[^/.]+$/, '')); // Nom sans extension
    setShowUploadForm(true);
    setUploadError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile || !newDocName.trim()) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadDocument(pendingFile, newDocName.trim());
      await loadDocuments();
      setPendingFile(null);
      setNewDocName('');
      setShowUploadForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await deleteDocument(id);
      onSelectionChange(selectedDocIds.filter(did => did !== id));
      await loadDocuments();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedDocIds.includes(id)) {
      onSelectionChange(selectedDocIds.filter(did => did !== id));
    } else {
      onSelectionChange([...selectedDocIds, id]);
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="flex gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.txt,.md"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 border-2 border-dashed border-rose-200 rounded-xl py-4 flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
        >
          <FileUp size={20} />
          <span className="font-bold text-sm">Importer un protocole (PDF, TXT)</span>
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && pendingFile && (
        <form onSubmit={handleUpload} className="bg-rose-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-rose-700">
            <FileText size={16} />
            <span className="font-medium truncate">{pendingFile.name}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="Nom du protocole..."
              className="flex-1 px-3 py-2 rounded-lg border border-rose-200 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
            />
            <button
              type="submit"
              disabled={isUploading || !newDocName.trim()}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false);
                setPendingFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
        </form>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Protocoles enregistrés ({documents.length})
            </span>
            {documents.length > 3 && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrer..."
                  className="pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg w-32 focus:w-40 transition-all outline-none focus:ring-1 focus:ring-rose-200"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-rose-400" size={24} />
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedDocIds.includes(doc.id)
                      ? 'bg-rose-100 border-rose-300'
                      : 'bg-white border-slate-100 hover:border-rose-200'
                  }`}
                  onClick={() => toggleSelection(doc.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedDocIds.includes(doc.id)
                        ? 'bg-rose-600 border-rose-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedDocIds.includes(doc.id) && <Check size={12} className="text-white" />}
                  </div>
                  <FileText size={16} className="text-rose-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedDocIds.length > 0 && (
            <p className="text-xs text-rose-600 font-medium">
              {selectedDocIds.length} protocole(s) sélectionné(s) - seront utilisés pour la réponse
            </p>
          )}
        </div>
      )}

      {documents.length === 0 && !isLoading && (
        <p className="text-center text-sm text-slate-400 py-4">
          Aucun protocole enregistré. Importez vos premiers documents.
        </p>
      )}
    </div>
  );
};

export default DocumentManager;
