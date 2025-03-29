import React, { useState } from 'react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon: string;
  children?: FileItem[];
  isActive?: boolean;
}

interface SidebarProps {
  onFileSelect: (file: FileItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Example file structure
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      icon: 'ri-folder-line text-blue-500',
      children: [
        {
          id: 'main.js',
          name: 'main.js',
          type: 'file',
          icon: 'ri-file-code-line text-indigo-400',
          isActive: true,
        },
        {
          id: 'api.js',
          name: 'api.js',
          type: 'file',
          icon: 'ri-file-code-line text-indigo-400',
        },
        {
          id: 'utils.js',
          name: 'utils.js',
          type: 'file',
          icon: 'ri-file-code-line text-indigo-400',
        },
      ],
    },
    {
      id: 'components',
      name: 'components',
      type: 'folder',
      icon: 'ri-folder-line text-blue-500',
    },
    {
      id: 'README.md',
      name: 'README.md',
      type: 'file',
      icon: 'ri-file-list-line text-gray-500',
    },
    {
      id: 'package.json',
      name: 'package.json',
      type: 'file',
      icon: 'ri-file-code-line text-orange-400',
    },
  ]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const selectFile = (file: FileItem) => {
    if (file.type === 'file') {
      // Update active file
      const updatedFiles = updateActiveFile(files, file.id);
      setFiles(updatedFiles);
      onFileSelect(file);
    }
  };

  // Helper function to update active file
  const updateActiveFile = (fileItems: FileItem[], activeId: string): FileItem[] => {
    return fileItems.map(item => {
      if (item.id === activeId) {
        return { ...item, isActive: true };
      } else if (item.children) {
        return {
          ...item,
          isActive: false,
          children: updateActiveFile(item.children, activeId)
        };
      } else {
        return { ...item, isActive: false };
      }
    });
  };

  // Render file tree recursively
  const renderFileTree = (items: FileItem[]) => {
    return items.map(item => (
      <div key={item.id} className="py-1">
        <div 
          className={`flex items-center py-1 cursor-pointer ${
            item.isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => selectFile(item)}
        >
          <i className={`${item.icon} mr-2`}></i>
          <span>{item.name}</span>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="ml-4">
            {renderFileTree(item.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <aside 
      className={`bg-gray-800 border-r border-gray-700 flex flex-col transition-all h-full ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {!collapsed && <h2 className="font-medium">Project Files</h2>}
        <button 
          className="text-gray-400 hover:text-white"
          onClick={toggleCollapse}
        >
          <i className={`ri-arrow-${collapsed ? 'right' : 'left'}-s-line`}></i>
        </button>
      </div>
      
      {!collapsed && (
        <>
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search files..." 
                className="w-full bg-gray-700 text-gray-100 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="ri-search-line absolute left-2.5 top-2 text-gray-400"></i>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-1">
              {/* File tree */}
              <div className="py-1 px-2 text-sm">
                {renderFileTree(files)}
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <h3 className="text-xs font-medium uppercase text-gray-400 mb-2">AI Assistant</h3>
            <div className="bg-blue-600 text-white p-2 rounded flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-robot-line mr-2"></i>
                <span className="text-sm">AI Ready</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 bg-blue-700 rounded">PRO</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
