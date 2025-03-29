import { apiRequest } from "./queryClient";

export interface CodeGenerationResult {
  code: string;
  language: string;
}

export interface CodeAnalysisResult {
  analysis: string;
  language: string;
}

export async function generateCodeFromPrompt(
  prompt: string,
  language: string = 'javascript'
): Promise<CodeGenerationResult> {
  const response = await apiRequest('POST', '/api/generate-code', {
    prompt,
    language,
  });
  
  return await response.json();
}

export async function completeCode(
  code: string,
  language: string = 'javascript'
): Promise<CodeGenerationResult> {
  const response = await apiRequest('POST', '/api/complete-code', {
    code,
    language,
  });
  
  return await response.json();
}

export async function analyzeCode(
  code: string,
  language: string = 'javascript'
): Promise<CodeAnalysisResult> {
  const response = await apiRequest('POST', '/api/analyze-code', {
    code,
    language,
  });
  
  return await response.json();
}

// Helper for getting language display name
export function getLanguageDisplayName(language: string): string {
  const languageMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'c': 'C',
    'cpp': 'C++',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'html': 'HTML',
    'css': 'CSS',
    'sql': 'SQL',
  };
  
  return languageMap[language.toLowerCase()] || language;
}

// Helper for getting language icon
export function getLanguageIcon(language: string): string {
  const languageMap: Record<string, string> = {
    'javascript': 'ri-javascript-line',
    'typescript': 'ri-file-code-line',
    'python': 'ri-file-code-line',
    'java': 'ri-file-code-line',
    'c': 'ri-file-code-line',
    'cpp': 'ri-file-code-line',
    'csharp': 'ri-file-code-line',
    'php': 'ri-file-code-line',
    'ruby': 'ri-file-code-line',
    'go': 'ri-file-code-line',
    'rust': 'ri-file-code-line',
    'swift': 'ri-file-code-line',
    'kotlin': 'ri-file-code-line',
    'html': 'ri-html5-line',
    'css': 'ri-css3-line',
    'sql': 'ri-database-line',
  };
  
  return languageMap[language.toLowerCase()] || 'ri-file-code-line';
}
