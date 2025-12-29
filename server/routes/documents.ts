import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  searchDocuments,
} from '../services/documentService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fichier requis' });
    }

    const { name, uploadedBy } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom du document requis' });
    }

    const doc = await uploadDocument(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      name,
      uploadedBy
    );

    res.json(doc);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur upload' });
  }
});

// List documents
router.get('/', async (_req, res) => {
  try {
    const docs = await listDocuments();
    res.json(docs);
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Erreur liste documents' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    await deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

// Search documents
router.post('/search', async (req, res) => {
  try {
    const { query, limit, documentIds } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query requise' });
    }

    const results = await searchDocuments(query, limit || 5, documentIds);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Erreur recherche' });
  }
});

export default router;
