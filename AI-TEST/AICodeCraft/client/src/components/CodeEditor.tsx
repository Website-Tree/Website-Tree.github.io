import React, { useEffect, useRef, useState } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  code: string;
  language?: string;
  onChange?: (code: string) => void;
}

// This mapping will need to be extended for more languages 
const languageExtensions: Record<string, any> = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  jsx: javascript({ jsx: true }),
  tsx: javascript({ jsx: true, typescript: true }),
};

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language = 'javascript',
  onChange = () => {}
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [lineCount, setLineCount] = useState<number>(0);
  
  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Clean up previous view
    if (editorView) {
      editorView.destroy();
    }
    
    const langExtension = languageExtensions[language] || languageExtensions.javascript;
    
    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        langExtension,
        keymap.of([indentWithTab]),
        oneDark,
        highlightActiveLine(),
        lineNumbers(),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            onChange(newCode);
            setLineCount(update.state.doc.lines);
          }
        }),
      ],
    });
    
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });
    
    setEditorView(view);
    setLineCount(view.state.doc.lines);
    
    // Cleanup on component unmount
    return () => {
      view.destroy();
    };
  }, [language]); // Recreate editor when language changes
  
  // Update code if external prop changes
  useEffect(() => {
    if (editorView && code !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: code
        }
      });
    }
  }, [code]);
  
  return (
    <div className="flex-1 overflow-auto bg-gray-900 h-full">
      <div className="h-full" ref={editorRef}></div>
    </div>
  );
};

export default CodeEditor;
