'use strict';

const { GoogleGenAI } = require('@google/genai');

/**
 * Controller to validate filled form data using Gemini AI.
 * POST /api/v1/validate
 */
exports.validateForm = async (req, res, next) => {
  try {
    const { formData } = req.body;

    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'formData object is required in the request body.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `
You are an expert AI form validation assistant.
Analyze the following filled form data.

1. Calculate a "validationScore" (0-100). Deduct points for missing, suspicious, or improperly formatted fields.
2. Provide an array of "errors" for any invalid formats (e.g. bad email format, wrong phone number length, etc.) or completely missing important fields.
3. Assess a "risk" level ("low", "medium", or "high") based on the inconsistencies, missing data, or potentially fraudulent/fake entries.
4. Provide an array of "suggestions" for the user to improve, correct, or complete their form submission.

Respond strictly with valid JSON matching this schema:
{
  "validationScore": number,
  "errors": ["...", "..."],
  "risk": "low" | "medium" | "high",
  "suggestions": ["...", "..."]
}

Form Data:
"""
${JSON.stringify(formData, null, 2)}
"""
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    
    // Attempt to parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      const cleaned = responseText.replace(/^\s*```json/i, '').replace(/```\s*$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Error during form validation:', error);
    next(error);
  }
};
