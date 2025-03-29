import React, { useState, useRef, useEffect } from 'react';
import { generateCodeFromPrompt } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  language?: string;
}

interface AIResponsePanelProps {
  onInsertCode?: (code: string) => void;
  selectedLanguage: string;
}

const AIResponsePanel: React.FC<AIResponsePanelProps> = ({ onInsertCode, selectedLanguage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update character count
  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Call OpenAI API
      const { code } = await generateCodeFromPrompt(input.trim(), selectedLanguage);
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Here\'s the code based on your request:',
        code,
        language: selectedLanguage,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Code copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="h-full border-l border-gray-700 flex flex-col bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h2 className="font-medium">AI Assistant</h2>
        <div className="flex items-center space-x-2">
          <button 
            className="text-gray-400 hover:text-white p-1"
            title="Clear"
            onClick={handleClearConversation}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
          <button 
            className="text-gray-400 hover:text-white p-1" 
            title="Close"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <i className="ri-robot-line text-4xl mb-2"></i>
            <p className="text-center">Ask the AI assistant to help you with coding tasks.</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className="flex items-start mb-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                message.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'
              } flex items-center justify-center mr-3`}>
                <i className={message.role === 'user' ? 'ri-user-line' : 'ri-robot-line'}></i>
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-2 max-w-full">
                <p className="text-sm">{message.content}</p>
                
                {message.code && (
                  <div className="bg-gray-900 rounded-md p-3 font-mono text-sm relative group mt-2">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button 
                        className="text-gray-400 hover:text-white p-1" 
                        title="Copy code"
                        onClick={() => copyToClipboard(message.code || '')}
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                      {onInsertCode && (
                        <button 
                          className="text-gray-400 hover:text-white p-1" 
                          title="Insert into editor"
                          onClick={() => onInsertCode(message.code || '')}
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      )}
                    </div>
                    <pre className="text-gray-100 whitespace-pre-wrap overflow-x-auto">{message.code}</pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea 
              placeholder="Ask AI for code help..." 
              className="w-full bg-gray-700 text-gray-100 rounded-lg pl-4 pr-10 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="absolute right-3 bottom-3 text-blue-500 hover:text-blue-400 p-1 bg-gray-800 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <i className="ri-loader-4-line animate-spin text-lg"></i>
              ) : (
                <i className="ri-send-plane-fill text-lg"></i>
              )}
            </button>
          </div>
          
          <div className="flex items-center mt-2 text-xs text-gray-400">
            <i className="ri-information-line mr-1"></i>
            <span>Use Shift+Enter for a new line. Press Enter to send.</span>
            <div className="flex-1"></div>
            <span className={`${
              charCount > 3900 ? 'text-red-500' : 
              charCount > 3500 ? 'text-yellow-500' : 
              'text-gray-500'
            }`}>{charCount}/4000</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIResponsePanel;
