import { Document, SearchResult } from '../types';

const API_URL = 'http://localhost:3333/api';

/**
 * Upload un document via l'API backend
 */
export const uploadDocument = async (
  file: File,
  documentName: string,
  uploadedBy?: string
): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', documentName);
  if (uploadedBy) {
    formData.append('uploadedBy', uploadedBy);
  }

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur upload');
  }

  return response.json();
};

/**
 * Liste tous les documents
 */
export const listDocuments = async (): Promise<Document[]> => {
  const response = await fetch(`${API_URL}/documents`);
  if (!response.ok) {
    throw new Error('Erreur liste documents');
  }
  return response.json();
};

/**
 * Supprime un document
 */
export const deleteDocument = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/documents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erreur suppression');
  }
};

/**
 * Recherche sémantique dans les documents
 */
export const searchDocuments = async (
  query: string,
  limit: number = 5,
  documentIds?: string[]
): Promise<SearchResult[]> => {
  const response = await fetch(`${API_URL}/documents/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit, documentIds }),
  });

  if (!response.ok) {
    throw new Error('Erreur recherche');
  }

  return response.json();
};
