import { GoogleGenerativeAI } from '@google/generative-ai';
import { Patient, FileData, SearchResult } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ VITE_GEMINI_API_KEY non configurée. Les fonctionnalités IA seront limitées.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Analyse rapide d'un terme médical au double-clic
 */
export const getQuickClinicalInsight = async (
  term: string,
  context: Patient
): Promise<string> => {
  if (!genAI) {
    return '⚠️ Fonctionnalité IA non disponible. Veuillez configurer VITE_GEMINI_API_KEY dans .env.local';
  }

  const systemInstruction = `Tu es un assistant expert pour les sages-femmes libérales.
La sage-femme a double-cliqué sur un terme spécifique : "${term}".
Analyse ce terme en fonction du contexte de la patiente (${context.firstName} ${context.lastName}, Statut: ${context.status}).
Indique précisément :
1. Les points de vigilance (risques potentiels).
2. Les examens ou suivis spécifiques à prévoir.
3. Des conseils pratiques pour la consultation.
Réponds de manière concise, sous forme de tirets, sur un ton professionnel.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-2.5-flash',
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Analyse clinique rapide pour : ${term}` }] }],
      generationConfig: {
        temperature: 0.2,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini Quick Insight Error:', error);
    return `Impossible d'obtenir l'analyse pour le moment. Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`;
  }
};

/**
 * Consultation IA complète avec support de protocoles et PDF
 */
export const getAIAdvisorResponse = async (
  prompt: string,
  customProtocol?: string,
  isStrict: boolean = false,
  patientContext?: Patient,
  fileData?: FileData
): Promise<string> => {
  if (!genAI) {
    return '⚠️ Fonctionnalité IA non disponible. Veuillez configurer VITE_GEMINI_API_KEY dans .env.local';
  }

  const contextText = patientContext
    ? `Contexte patiente: ${patientContext.firstName} ${patientContext.lastName}, ${patientContext.status}.
       Dernière visite: ${patientContext.lastVisit}.`
    : '';

  let systemInstruction = `Tu es un assistant médical spécialisé pour les sages-femmes libérales en France.
Réponds de manière professionnelle, concise et en français.`;

  if (isStrict) {
    const sourceDescription = fileData
      ? 'le fichier PDF fourni'
      : customProtocol
      ? 'le protocole textuel fourni'
      : 'les documents fournis';
    systemInstruction = `Tu es un assistant strict basé EXCLUSIVEMENT sur ${sourceDescription}.
TES RÈGLES :
1. Tu ne dois utiliser QUE les informations contenues dans les documents fournis (texte ou PDF).
2. Si la réponse à la question n'est pas dans les documents, réponds exactement : "Désolé, cette information ne figure pas dans les documents fournis."
3. N'utilise aucune connaissance externe, même si elle te semble correcte médicalement.
4. Cite les parties des documents pour justifier ta réponse.`;

    if (customProtocol && !fileData) {
      systemInstruction += `\n\nPROTOCOLE DE RÉFÉRENCE :\n${customProtocol}`;
    }
  } else {
    if (customProtocol) {
      systemInstruction += `\nUtilise ce protocole comme source prioritaire : \n${customProtocol}`;
    }
    if (fileData) {
      systemInstruction += `\nAnalyse également le fichier PDF fourni pour répondre au mieux à la sage-femme.`;
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-2.5-flash',
      systemInstruction,
    });

    const parts: any[] = [{ text: `${contextText}\n\nQuestion de la sage-femme: ${prompt}` }];
    if (fileData) {
      parts.push(fileData);
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: isStrict ? 0.1 : 0.7,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `Désolé, une erreur est survenue lors de la consultation de l'assistant IA. Erreur: ${
      error instanceof Error ? error.message : 'Inconnue'
    }`;
  }
};

/**
 * Consultation IA avec contexte RAG (documents pertinents)
 */
export const getAIAdvisorResponseWithRAG = async (
  prompt: string,
  relevantChunks: SearchResult[],
  isStrict: boolean = false,
  patientContext?: Patient
): Promise<string> => {
  if (!genAI) {
    return '⚠️ Fonctionnalité IA non disponible. Veuillez configurer VITE_GEMINI_API_KEY dans .env.local';
  }

  const contextText = patientContext
    ? `Contexte patiente: ${patientContext.firstName} ${patientContext.lastName}, ${patientContext.status}.
       Dernière visite: ${patientContext.lastVisit}.`
    : '';

  const documentsContext = relevantChunks.length > 0
    ? `\n\nDOCUMENTS DE RÉFÉRENCE:\n${relevantChunks.map((chunk) =>
        `--- Document: ${chunk.document_name} (pertinence: ${(chunk.similarity * 100).toFixed(1)}%) ---\n${chunk.chunk_content}`
      ).join('\n\n')}`
    : '';

  let systemInstruction = `Tu es un assistant médical spécialisé pour les sages-femmes libérales en France.
Réponds de manière professionnelle, concise et en français.`;

  if (isStrict && relevantChunks.length > 0) {
    systemInstruction = `Tu es un assistant strict basé EXCLUSIVEMENT sur les documents fournis.
TES RÈGLES :
1. Tu ne dois utiliser QUE les informations contenues dans les documents fournis.
2. Si la réponse à la question n'est pas dans les documents, réponds exactement : "Désolé, cette information ne figure pas dans les documents fournis."
3. N'utilise aucune connaissance externe, même si elle te semble correcte médicalement.
4. Cite les parties des documents pour justifier ta réponse.`;
  } else if (relevantChunks.length > 0) {
    systemInstruction += `\nUtilise les documents fournis comme source prioritaire pour ta réponse.`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-2.5-flash',
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${contextText}${documentsContext}\n\nQuestion de la sage-femme: ${prompt}` }] }],
      generationConfig: {
        temperature: isStrict ? 0.1 : 0.7,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `Désolé, une erreur est survenue lors de la consultation de l'assistant IA. Erreur: ${
      error instanceof Error ? error.message : 'Inconnue'
    }`;
  }
};

/**
 * Résumé du dossier patient pour transmission
 */
export const summarizePatientHistory = async (patient: Patient): Promise<string> => {
  if (!genAI) {
    return '⚠️ Fonctionnalité IA non disponible. Veuillez configurer VITE_GEMINI_API_KEY dans .env.local';
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-2.5-flash',
      systemInstruction:
        'Tu es une sage-femme. Fais un résumé synthétique des points clés, antécédents et points de vigilance.',
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `Résume le dossier de cette patiente pour une transmission: ${JSON.stringify(patient)}` }],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini Summarize Error:', error);
    return `Impossible de générer le résumé. Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`;
  }
};
