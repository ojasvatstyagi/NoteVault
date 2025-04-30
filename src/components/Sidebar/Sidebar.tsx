import React from 'react';
import { Archive, Tag, Download, Upload, Home, Bell } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { parseImportedFile, formatReminderDate } from '../../utils/helpers';
import { useToast } from '../UI/Toast';

const Sidebar: React.FC = () => {
  const { 
    notes,
    getAllTags, 
    activeTag, 
    setActiveTag, 
    exportNotes, 
    importNotes 
  } = useNotes();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const tags = getAllTags();

  // Get all notes with active reminders
  const notesWithReminders = notes.filter(note => 
    note.reminder && new Date(note.reminder) > new Date()
  ).sort((a, b) => {
    const dateA = new Date(a.reminder!);
    const dateB = new Date(b.reminder!);
    return dateA.getTime() - dateB.getTime();
  });

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedNotes = parseImportedFile(content);
        importNotes(importedNotes);
        addToast(`Successfully imported ${importedNotes.length} notes`, 'success');
      } catch (error) {
        addToast('Failed to import notes. Invalid file format.', 'error');
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExportClick = () => {
    exportNotes();
    addToast('Notes exported successfully', 'success');
  };

  const SidebarItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
    count?: number;
    subtext?: string;
  }> = ({ icon, label, onClick, active, count, subtext }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <div className="flex-1 text-left">
        <div>{label}</div>
        {subtext && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{subtext}</div>
        )}
      </div>
      {count !== undefined && (
        <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-64px)] overflow-y-auto py-4 px-2 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="space-y-4">
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </h3>
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            label="Home"
            onClick={() => setActiveTag(null)}
            active={activeTag === null}
          />
          <SidebarItem
            icon={<Archive className="h-4 w-4" />}
            label="Archive"
            onClick={() => setActiveTag('archived')}
            active={activeTag === 'archived'}
          />
          <SidebarItem
            icon={<Download className="h-4 w-4" />}
            label="Export Notes"
            onClick={handleExportClick}
          />
          <SidebarItem
            icon={<Upload className="h-4 w-4" />}
            label="Import Notes"
            onClick={handleImportClick}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {notesWithReminders.length > 0 && (
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reminders
            </h3>
            <div className="space-y-1">
              {notesWithReminders.map((note) => (
                <SidebarItem
                  key={note.id}
                  icon={<Bell className="h-4 w-4" />}
                  label={note.title || 'Untitled Note'}
                  subtext={formatReminderDate(note.reminder!)}
                  onClick={() => handleTagClick(`reminder-${note.id}`)}
                  active={activeTag === `reminder-${note.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tags
            </h3>
            <div className="space-y-1">
              {tags.map((tag) => (
                <SidebarItem
                  key={tag}
                  icon={<Tag className="h-4 w-4" />}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  active={activeTag === tag}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;