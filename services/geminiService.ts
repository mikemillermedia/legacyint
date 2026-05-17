/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK using your Vercel Environment Variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const sendMessageToGemini = async (prompt: string): Promise<string> => {
  try {
    // FIX: Swapped to 'gemini-pro' which is fully supported by your current package version
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "I'm currently undergoing a quick maintenance update. Please try again in a few minutes!";
  }
};
