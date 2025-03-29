import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key"
});

export async function generateCodeFromPrompt(
  prompt: string,
  language: string = 'javascript'
): Promise<string> {
  try {
    const systemPrompt = `You are an expert programmer. Generate clean, efficient, and well-documented ${language} code based on the following prompt. 
    Include comments to explain complex parts. Focus on best practices and maintainable code.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "No code was generated. Please try again.";
  } catch (error: any) {
    console.error("Error generating code from OpenAI:", error);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

export async function generateCodeCompletions(
  code: string,
  language: string = 'javascript'
): Promise<string> {
  try {
    const systemPrompt = `You are an expert ${language} programmer. Complete the following code snippet with high-quality, well-documented code.
    Focus on readability and best practices.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Complete this code:\n\n${code}` }
      ],
    });

    return response.choices[0].message.content || "No completions were generated. Please try again.";
  } catch (error: any) {
    console.error("Error generating code completions from OpenAI:", error);
    throw new Error(`Failed to generate code completions: ${error.message}`);
  }
}

export async function analyzeCode(
  code: string,
  language: string = 'javascript'
): Promise<string> {
  try {
    const systemPrompt = `You are an expert code reviewer specializing in ${language}. 
    Analyze the following code for errors, potential improvements, security concerns, 
    and adherence to best practices. Provide actionable suggestions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Review this code:\n\n${code}` }
      ],
    });

    return response.choices[0].message.content || "No analysis was generated. Please try again.";
  } catch (error: any) {
    console.error("Error analyzing code with OpenAI:", error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}
