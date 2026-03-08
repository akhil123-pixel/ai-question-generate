import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    // In the frontend, the platform automatically handles the API key via process.env.GEMINI_API_KEY
    // or through the proxy.
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (process as any).env.GEMINI_API_KEY;
    
    // If apiKey is not found, the SDK will likely fail with a clear error
    // which we will catch and handle.
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
};

/**
 * Calls Gemini API with exponential backoff retry logic for 503/429 errors.
 */
const callGeminiWithRetry = async (params: GenerateContentParameters, maxRetries = 3) => {
  const ai = getAI();
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const isRetryable = 
        err.message?.includes("503") || 
        err.message?.includes("high demand") || 
        err.message?.includes("429") ||
        err.message?.includes("Resource has been exhausted");

      if (isRetryable && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Gemini API busy (attempt ${i + 1}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

export const geminiService = {
  extractSkillsFromText: async (text: string): Promise<string[]> => {
    if (!text || text.trim().length < 10) {
      console.warn("Text too short for skill extraction");
      return [];
    }

    const prompt = `You are an expert HR assistant and technical recruiter. Your task is to extract a comprehensive list of technical and soft skills from the following resume text.
    
    Instructions:
    - Identify programming languages (e.g., JavaScript, Python, C++).
    - Identify frameworks and libraries (e.g., React, Node.js, TensorFlow).
    - Identify tools and platforms (e.g., Docker, AWS, Git, VS Code).
    - Identify methodologies (e.g., Agile, Scrum, TDD).
    - Identify soft skills (e.g., Leadership, Communication, Problem Solving).
    - Identify domain-specific knowledge (e.g., Financial Analysis, Marketing Strategy).
    - Return the results as a JSON object with a "skills" key containing an array of strings.
    - If the text is messy or contains OCR errors, do your best to infer the skills.
    - If no skills can be identified, return {"skills": []}.
    
    Resume Text:
    ${text}`;

    try {
      const response = await callGeminiWithRetry({
        model: "gemini-2.5-flash", // Using Flash for faster frontend response
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of technical and soft skills identified in the text"
              },
            },
            required: ["skills"],
          },
        },
      });

      const result = JSON.parse(response.text || "{\"skills\": []}");
      return result.skills || [];
    } catch (err: any) {
      console.error("Error calling Gemini for skills extraction:", err);
      throw err;
    }
  },

  generateInterviewQuestions: async (
    skills: string[],
    difficulty: string,
    questionType: string,
    count: number
  ): Promise<any[]> => {
    const prompt = `You are an expert technical interviewer.
    
    Generate interview questions based on the following candidate skills:
    
    Skills: ${skills.join(", ")}
    Difficulty: ${difficulty}
    Question Type: ${questionType}
    Number of Questions: ${count}
    
    For each question provide:
    - interview question
    - detailed answer
    - key points interviewer expects.
    
    Return JSON format.`;

    try {
      const response = await callGeminiWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                key_points: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["question", "answer", "key_points"],
            },
          },
        },
      });

      const questions = JSON.parse(response.text || "[]");
      return questions;
    } catch (err) {
      console.error("Error calling Gemini for question generation:", err);
      throw err;
    }
  }
};
