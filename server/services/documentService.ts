import { neon } from '@neondatabase/serverless';
import { GoogleGenerativeAI } from '@google/generative-ai';

const connectionString = process.env.NEON_CONNECTION_STRING;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!connectionString) {
  console.warn('⚠️ NEON_CONNECTION_STRING non configurée');
}

if (!geminiApiKey) {
  console.warn('⚠️ GEMINI_API_KEY non configurée');
}

const sql = connectionString ? neon(connectionString) : null;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// Types
export interface Document {
  id: string;
  name: string;
  file_type: string;
  original_filename: string;
  content_text?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  document_id: string;
  document_name: string;
  chunk_content: string;
  similarity: number;
}

/**
 * Extrait le texte d'un buffer PDF via Gemini
 */
export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  if (!genAI) throw new Error('Gemini API non configurée');

  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

  const base64Data = buffer.toString('base64');

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Data,
      },
    },
    'Extrais tout le texte de ce document PDF. Retourne UNIQUEMENT le texte brut, sans formatage markdown, sans commentaires. Conserve la structure des paragraphes.',
  ]);

  const text = result.response.text();

  // Nettoyer les caractères problématiques
  return text
    .replace(/\x00/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
};

/**
 * Découpe un texte en chunks avec chevauchement
 */
export const chunkText = (text: string): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);

    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const cutPoint = Math.max(lastPeriod, lastNewline);
      if (cutPoint > CHUNK_SIZE / 2) {
        chunk = chunk.slice(0, cutPoint + 1);
      }
    }

    chunks.push(chunk.trim());
    start += chunk.length - CHUNK_OVERLAP;
    if (start < 0) start = chunk.length;
  }

  return chunks.filter(c => c.length > 50);
};

/**
 * Génère un embedding via Gemini
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!genAI) throw new Error('Gemini API non configurée');
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

/**
 * Génère des embeddings en batch
 */
export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (!genAI) throw new Error('Gemini API non configurée');
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const results = await Promise.all(texts.map(text => model.embedContent(text)));
  return results.map(r => r.embedding.values);
};

/**
 * Upload un document complet
 */
export const uploadDocument = async (
  buffer: Buffer,
  filename: string,
  mimeType: string,
  documentName: string,
  uploadedBy?: string
): Promise<Document> => {
  if (!sql) throw new Error('Base de données non configurée');

  // Extraction du texte
  let contentText: string;
  if (mimeType === 'application/pdf') {
    contentText = await extractTextFromPDF(buffer);
  } else {
    contentText = buffer.toString('utf-8').replace(/\x00/g, '').trim();
  }

  if (!contentText) {
    throw new Error('Impossible d\'extraire le texte du document');
  }

  // Insertion du document
  const [doc] = await sql`
    INSERT INTO documents (name, file_type, original_filename, content_text, uploaded_by)
    VALUES (${documentName}, ${mimeType}, ${filename}, ${contentText}, ${uploadedBy || null})
    RETURNING *
  `;

  // Découpage en chunks
  const chunks = chunkText(contentText);

  if (chunks.length === 0) {
    throw new Error('Document trop court pour être indexé');
  }

  // Génération des embeddings
  const embeddings = await generateEmbeddings(chunks);

  // Insertion des chunks
  for (let i = 0; i < chunks.length; i++) {
    const cleanContent = chunks[i].replace(/\x00/g, '').trim();
    await sql`
      INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
      VALUES (${doc.id}, ${i}, ${cleanContent}, ${JSON.stringify(embeddings[i])}::vector)
    `;
  }

  return doc as Document;
};

/**
 * Liste tous les documents
 */
export const listDocuments = async (): Promise<Document[]> => {
  if (!sql) return [];
  const docs = await sql`
    SELECT id, name, file_type, original_filename, uploaded_by, created_at, updated_at
    FROM documents
    ORDER BY created_at DESC
  `;
  return docs as Document[];
};

/**
 * Supprime un document
 */
export const deleteDocument = async (id: string): Promise<void> => {
  if (!sql) throw new Error('Base de données non configurée');
  await sql`DELETE FROM documents WHERE id = ${id}`;
};

/**
 * Recherche sémantique
 */
export const searchDocuments = async (
  query: string,
  limit: number = 5,
  documentIds?: string[]
): Promise<SearchResult[]> => {
  if (!sql) return [];

  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = JSON.stringify(queryEmbedding);

  let results;
  if (documentIds && documentIds.length > 0) {
    results = await sql`
      SELECT
        dc.document_id,
        d.name as document_name,
        dc.content as chunk_content,
        1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      WHERE dc.document_id = ANY(${documentIds}::uuid[])
      ORDER BY dc.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;
  } else {
    results = await sql`
      SELECT
        dc.document_id,
        d.name as document_name,
        dc.content as chunk_content,
        1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      ORDER BY dc.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;
  }

  return results as SearchResult[];
};
