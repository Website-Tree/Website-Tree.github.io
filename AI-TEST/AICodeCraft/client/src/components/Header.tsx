import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <i className="ri-code-box-line text-blue-500 text-2xl mr-2"></i>
          <h1 className="text-xl font-semibold text-white">CodeAssist AI</h1>
        </div>
        <div className="hidden md:flex space-x-1">
          <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">File</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">Edit</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">View</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">Help</button>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="text-gray-400 hover:text-white" title="Settings">
          <i className="ri-settings-3-line text-lg"></i>
        </button>
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
          <span className="text-sm font-medium">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
