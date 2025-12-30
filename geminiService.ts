
import { GoogleGenAI, Type } from "@google/genai";
import { SensorData, AssessmentResult, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `
You are an AI-based real-time safety assessment system for public buses.
Your task is to analyze sensor data and predict accident risk as LOW, MEDIUM, or HIGH.
You must provide a concise, engineering-focused explanation justifying the risk level.

Risk Priority Guidelines:
- HIGH RISK: Extremely low side clearances (< 30cm), high closing speeds (> 5 m/s), or high vehicle speeds (> 80 km/h) in traffic.
- MEDIUM RISK: Moderate side clearances (30-80cm), moderate closing speeds (2-5 m/s), or high speed in highway mode with adequate clearance.
- LOW RISK: Wide clearances (> 100cm), low closing speeds (< 2 m/s), and controlled vehicle speeds in appropriate modes.

Driving modes significantly impact risk sensitivity:
- Depot: High sensitivity to clearance (tight maneuvering).
- Traffic: High sensitivity to closing speeds and frequent braking.
- Highway: High sensitivity to vehicle speed and lane-keeping clearance.
`;

export const assessSafetyRisk = async (data: SensorData): Promise<AssessmentResult> => {
  const prompt = `
    Analyze current sensor status:
    - Left Clearance: ${data.leftDistance} cm
    - Right Clearance: ${data.rightDistance} cm
    - Closing Speed: ${data.closingSpeed} m/s
    - Vehicle Speed: ${data.vehicleSpeed} km/h
    - Driving Mode: ${data.drivingMode}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              description: "The calculated risk level (LOW, MEDIUM, HIGH)",
            },
            explanation: {
              type: Type.STRING,
              description: "A concise engineering justification",
            },
          },
          required: ["riskLevel", "explanation"],
        },
      },
    });

    const resultJson = JSON.parse(response.text || "{}");
    
    return {
      riskLevel: (resultJson.riskLevel as RiskLevel) || RiskLevel.LOW,
      explanation: resultJson.explanation || "Unable to generate assessment.",
      timestamp: Date.now(),
      data,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to assess safety risk.");
  }
};
