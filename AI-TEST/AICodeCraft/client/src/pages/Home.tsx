import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EditorTabs, { TabItem } from '@/components/EditorTabs';
import CodeEditor from '@/components/CodeEditor';
import AIResponsePanel from '@/components/AIResponsePanel';
import StatusBar from '@/components/StatusBar';
import { useToast } from '@/hooks/use-toast';

interface FileData {
  id: string;
  name: string;
  content: string;
  language: string;
}

// Default example files
const defaultFiles: FileData[] = [
  {
    id: 'main.js',
    name: 'main.js',
    content: `// AI Code Completion Assistant
import { OpenAI } from 'openai';

// Initialize the OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your API key to environment variables
});

/**
 * Generate code suggestions based on user prompt
 * @param {string} prompt - User's code query
 * @param {string} language - Programming language
 * @returns {Promise<string>} - Generated code
 */
async function generateCodeSuggestion(prompt, language = 'javascript') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: \`Write \${language} code: \${prompt}\` }],
    });
`,
    language: 'javascript',
  },
  {
    id: 'api.js',
    name: 'api.js',
    content: `// API client for making requests
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default fetchData;`,
    language: 'javascript',
  },
];

const Home: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'main.js', title: 'main.js', isActive: true },
  ]);
  const [activeFile, setActiveFile] = useState<FileData>(defaultFiles[0]);
  const [files, setFiles] = useState<FileData[]>(defaultFiles);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const { toast } = useToast();
  
  const handleFileSelect = (file: any) => {
    // Find the file in our files list
    const selectedFile = files.find(f => f.id === file.id);
    if (!selectedFile) {
      // Create a new file if it doesn't exist yet
      const newFile: FileData = {
        id: file.id,
        name: file.name,
        content: '',
        language: getLanguageFromFilename(file.name),
      };
      setFiles([...files, newFile]);
      setActiveFile(newFile);
    } else {
      setActiveFile(selectedFile);
    }
    
    // Update tabs
    if (!tabs.some(tab => tab.id === file.id)) {
      // Add to tabs if not present
      setTabs(prevTabs => [
        ...prevTabs.map(tab => ({ ...tab, isActive: false })),
        { id: file.id, title: file.name, isActive: true }
      ]);
    } else {
      // Just activate the tab
      setTabs(prevTabs => 
        prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === file.id
        }))
      );
    }
  };
  
  const handleTabClick = (tab: TabItem) => {
    // Activate the clicked tab and set the corresponding file as active
    setTabs(prevTabs => 
      prevTabs.map(t => ({
        ...t,
        isActive: t.id === tab.id
      }))
    );
    
    const fileToActivate = files.find(f => f.id === tab.id);
    if (fileToActivate) {
      setActiveFile(fileToActivate);
    }
  };
  
  const handleTabClose = (tab: TabItem) => {
    if (tabs.length === 1) {
      toast({
        title: "Cannot close tab",
        description: "At least one tab must remain open",
        variant: "destructive",
      });
      return;
    }
    
    // Remove the tab
    const newTabs = tabs.filter(t => t.id !== tab.id);
    
    // If we closed the active tab, activate another one
    if (tab.isActive && newTabs.length > 0) {
      newTabs[newTabs.length - 1].isActive = true;
      const nextActiveFile = files.find(f => f.id === newTabs[newTabs.length - 1].id);
      if (nextActiveFile) {
        setActiveFile(nextActiveFile);
      }
    }
    
    setTabs(newTabs);
  };
  
  const handleCodeChange = (newCode: string) => {
    // Update the active file's content
    setActiveFile(prev => ({ ...prev, content: newCode }));
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === activeFile.id ? { ...file, content: newCode } : file
      )
    );
  };
  
  const handleInsertCode = (code: string) => {
    // Insert AI generated code into the editor
    handleCodeChange(
      activeFile.content + (activeFile.content.endsWith('\n') ? '' : '\n\n') + code
    );
    
    toast({
      title: "Code inserted",
      description: "The generated code has been added to your editor",
    });
  };
  
  // Helper function to determine language from filename
  const getLanguageFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const extensionMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'html': 'html',
      'css': 'css',
    };
    
    return extensionMap[extension || ''] || 'javascript';
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onFileSelect={handleFileSelect} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs 
            tabs={tabs} 
            onTabClick={handleTabClick} 
            onTabClose={handleTabClose} 
          />
          
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <CodeEditor 
              code={activeFile.content} 
              language={activeFile.language}
              onChange={handleCodeChange}
            />
            
            <div className="md:w-2/5">
              <AIResponsePanel 
                onInsertCode={handleInsertCode}
                selectedLanguage={activeFile.language}
              />
            </div>
          </div>
          
          <StatusBar 
            language={activeFile.language.charAt(0).toUpperCase() + activeFile.language.slice(1)}
            position={cursorPosition}
            connected={true}
            modelName="GPT-4o"
          />
        </main>
      </div>
    </div>
  );
};

export default Home;
