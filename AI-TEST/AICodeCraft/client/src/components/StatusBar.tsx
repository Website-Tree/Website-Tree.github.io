import React from 'react';

interface StatusBarProps {
  language: string;
  position?: { line: number; column: number };
  connected?: boolean;
  modelName?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  language = 'JavaScript', 
  position = { line: 1, column: 1 },
  connected = true,
  modelName = 'GPT-4o'
}) => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 px-4 py-1 text-xs text-gray-400 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <i className={`${getLanguageIcon(language)} mr-1`}></i>
          <span>{language}</span>
        </div>
        <div>Line {position.line}, Col {position.column}</div>
        <div>UTF-8</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <i className="ri-cpu-line mr-1"></i>
          <span>{modelName}</span>
        </div>
        <div className={`flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
          <i className={`${connected ? 'ri-check-line' : 'ri-close-line'} mr-1`}></i>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </footer>
  );
};

function getLanguageIcon(language: string): string {
  const iconMap: Record<string, string> = {
    'JavaScript': 'ri-javascript-line text-yellow-400',
    'TypeScript': 'ri-file-code-line text-blue-400',
    'Python': 'ri-python-line text-green-400',
    'Java': 'ri-file-code-line',
    'HTML': 'ri-html5-line text-orange-400',
    'CSS': 'ri-css3-line text-blue-500',
  };
  
  return iconMap[language] || 'ri-file-code-line';
}

export default StatusBar;
