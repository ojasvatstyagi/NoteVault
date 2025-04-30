import React, { useState, useEffect, useRef } from 'react';
import { Tag, Plus, Check, Trash2, Copy, Download, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNotes } from '../../context/NotesContext';
import { Note, ColorOption } from '../../types';
import { countWords, countChars } from '../../utils/helpers';

interface NoteEditorProps {
  note?: Note;
  isNew?: boolean;
  onClose: () => void;
  onSave?: (note: { title: string; content: string }) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, isNew, onClose, onSave }) => {
  const { updateNote } = useNotes();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor] = useState(note?.color ?? 'default');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(countWords(note?.content ?? ''));
  const [charCount, setCharCount] = useState(countChars(note?.content ?? ''));
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const colorOptions: ColorOption[] = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    };
    
    return colorMap[colorName] || colorMap.default;
  };

  // Effect for continuous save
  useEffect(() => {
    if (!isNew && note) {
      setIsSaving(true);
      updateNote(note.id, { title, content, color, tags });
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, color, tags]);

  // Update word and character count when content changes
  useEffect(() => {
    setWordCount(countWords(content));
    setCharCount(countChars(content));
  }, [content]);

  // Handle click outside of color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      toast.success('Tag added successfully');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    toast.success('Tag removed successfully');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (isNew && onSave) {
      if (!title.trim() && !content.trim()) {
        toast.error('Please enter a title or content for the note');
        return;
      }
      onSave({ title, content });
    }
  };

  const handleExportNote = () => {
    const noteContent = {
      title: title || 'Untitled Note',
      content,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    const dataStr = JSON.stringify(noteContent, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${title || 'untitled'}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Note exported successfully');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast.success('Note content copied to clipboard');
      },
      () => {
        toast.error('Failed to copy to clipboard');
      }
    );
  };

  return (
    <div className={`flex flex-col h-full min-h-[60vh] ${getColorClass(color)}`}>
      {/* Editor Header */}
      <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          {/* Color Picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="Change note color"
            >
              <div className={`w-4 h-4 rounded-full border ${getColorClass(color)}`}></div>
            </button>
            
            {showColorPicker && (
              <div className="absolute z-10 left-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 border border-gray-200 dark:border-gray-700 flex space-x-1">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption}
                    onClick={() => {
                      setColor(colorOption);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border ${getColorClass(colorOption)} ${
                      colorOption === color ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    aria-label={`Set note color to ${colorOption}`}
                  ></button>
                ))}
              </div>
            )}
          </div>
          
          {!isNew && (
            <>
              {/* Export Note */}
              <button
                onClick={handleExportNote}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Export note"
              >
                <Download className="h-4 w-4" />
              </button>
              
              {/* Copy to Clipboard */}
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isNew ? (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Note
              </button>
            </>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <span className="flex items-center">
                  <Check className="h-3 w-3 text-green-500 mr-1" />
                  Saved
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-4 bg-transparent border-none focus:outline-none text-xl font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />

      {/* Content Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your note here..."
        className="w-full flex-1 p-4 bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none"
        autoFocus
      ></textarea>

      {/* Tags Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            Tags:
          </span>
          
          {tags.map((tag) => (
            <span 
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag"
              className="text-sm px-2 py-1 w-24 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddTag}
              className="inline-flex items-center px-2 py-1 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Word and character count */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;