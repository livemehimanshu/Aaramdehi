import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { FileText, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, RotateCcw } from 'lucide-react';
import './TipTapEditor.css';

const TipTapEditor = ({ value, onChange, placeholder = "Paste your description here..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none w-full h-64 overflow-y-auto px-4 py-3 text-white',
        spellcheck: 'false',
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <ErrorBoundary>
      <div className="mt-6">
        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
          <FileText size={12} /> Full Description (Rich Text)
        </label>
        <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
          {/* Toolbar */}
          <div className="bg-gray-900 border-b border-gray-800 p-3 flex flex-wrap gap-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded ${editor.isActive('bold') ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded ${editor.isActive('italic') ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded ${editor.isActive('strike') ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Strikethrough"
            >
              <Underline size={16} />
            </button>

            <div className="border-l border-gray-700"></div>

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-3 py-2 rounded text-sm font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-2 rounded text-sm font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Heading 2"
            >
              H2
            </button>

            <div className="border-l border-gray-700"></div>

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Ordered List"
            >
              <ListOrdered size={16} />
            </button>

            <div className="border-l border-gray-700"></div>

            <button
              onClick={addLink}
              className={`p-2 rounded ${editor.isActive('link') ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-colors`}
              title="Add Link"
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              title="Add Image"
            >
              <ImageIcon size={16} />
            </button>

            <div className="border-l border-gray-700"></div>

            <button
              onClick={() => editor.chain().focus().clearNodes().run()}
              className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              title="Clear Formatting"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Editor */}
          <div className="bg-gray-950 p-4 min-h-64 tiptap-editor">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TipTapEditor;
