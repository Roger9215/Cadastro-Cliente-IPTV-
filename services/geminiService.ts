import { GoogleGenAI } from "@google/genai";
import { Customer, PaymentStatus } from "../types";

// Initialize Gemini Client
// Note: In a real production build, this key comes from the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCustomerMessage = async (customer: Customer, type: 'REMINDER' | 'WELCOME' | 'PROMO'): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Erro: Chave de API do Gemini não configurada. Por favor, configure a API_KEY no ambiente.";
  }

  const model = "gemini-2.5-flash";
  
  let promptContext = "";

  if (type === 'REMINDER') {
    promptContext = `
      Crie uma mensagem curta, educada e profissional para WhatsApp.
      O cliente ${customer.name} está com o pagamento ${customer.paymentStatus}.
      O vencimento é/foi em ${customer.dueDate}.
      O valor do plano é R$ ${customer.planPrice.toFixed(2)}.
      Plataforma: ${customer.platform}.
      Se estiver Inadimplente, cobre suavemente. Se estiver perto do vencimento, apenas lembre.
      Use emojis relacionados a TV/Filmes.
    `;
  } else if (type === 'WELCOME') {
    promptContext = `
      Crie uma mensagem de boas-vindas animada para o cliente ${customer.name}.
      Plataforma: ${customer.platform}.
      App sugerido: ${customer.appName}.
      Telas: ${customer.screenCount}.
      Agradeça a preferência pela IPTV PREMIUM.
      Use emojis.
    `;
  } else {
    promptContext = `
      Crie uma mensagem curta oferecendo uma renovação antecipada para ${customer.name}.
      Mencione que ele tem um desconto atual de R$ ${customer.discount} e bonus: ${customer.bonus}.
      Use emojis.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: promptContext,
    });
    
    return response.text || "Não foi possível gerar a mensagem.";
  } catch (error) {
    console.error("Error generating message:", error);
    return "Erro ao conectar com a Inteligência Artificial.";
  }
};