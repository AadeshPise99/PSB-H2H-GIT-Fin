import { GoogleGenAI } from "@google/genai";
import { GENERATION_PROMPT } from '../constants';

const apiKey = process.env.API_KEY || '';
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateBankXml = async (): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: GENERATION_PROMPT,
    });

    const text = response.text || '';
    // Strip markdown formatting if present
    return text.replace(/```xml/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback to static template if API fails (graceful degradation)
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
     <header>
          <source>BoB</source>
          <datetime>${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}</datetime>
          <description>FR update message to sp (Fallback)</description>
     </header>
     <fundingresponses>
          <fundingresponse action="fund" action_date="${new Date().toISOString().slice(0,10).replace(/-/g,'')}" amount="2000" comment="Transaction declined Successfully" currency="INR" id="frq#PSBFALLBACK${Math.floor(Math.random()*100000)}" due_date="20251220" bank_ref="BARBHFALLBACK"/>
     </fundingresponses>
</request>`;
  }
};