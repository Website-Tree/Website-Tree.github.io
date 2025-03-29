import React from 'react';

export interface TabItem {
  id: string;
  title: string;
  isActive: boolean;
}

interface EditorTabsProps {
  tabs: TabItem[];
  onTabClick: (tab: TabItem) => void;
  onTabClose: (tab: TabItem) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ tabs, onTabClick, onTabClose }) => {
  return (
    <div className="bg-gray-800 flex items-center border-b border-gray-700 text-sm overflow-x-auto">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          className={`px-4 py-2 flex items-center border-r border-gray-700 ${
            tab.isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => onTabClick(tab)}
        >
          <span>{tab.title}</span>
          <i 
            className="ri-close-line ml-2 text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab);
            }}
          ></i>
        </button>
      ))}
      <div className="flex-1"></div>
    </div>
  );
};

export default EditorTabs;
