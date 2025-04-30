import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Note, NotesContextType, SortOption, SortDirection, ViewMode } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [reminderTimeouts, setReminderTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({});

  // Fetch notes from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedNotes = data.map(note => ({
          ...note,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          reminder: note.reminder ? new Date(note.reminder) : null,
          isPinned: note.is_pinned,
          isArchived: note.is_archived,
        }));

        setNotes(formattedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to fetch notes');
      }
    };

    fetchNotes();
  }, [user]);

  // Set up timeouts for all reminders
  useEffect(() => {
    Object.values(reminderTimeouts).forEach(timeout => clearTimeout(timeout));
    const newTimeouts: { [key: string]: NodeJS.Timeout } = {};

    notes.forEach(note => {
      if (note.reminder) {
        const reminderTime = new Date(note.reminder).getTime();
        const now = new Date().getTime();
        const delay = reminderTime - now;

        if (delay > 0) {
          newTimeouts[note.id] = setTimeout(() => {
            toast.info(`Reminder: ${note.title}`, {
              autoClose: false,
              onClick: () => setActiveTag(`reminder-${note.id}`),
            });
            updateNote(note.id, { reminder: null });
          }, delay);
        }
      }
    });

    setReminderTimeouts(newTimeouts);
    return () => {
      Object.values(reminderTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [notes]);

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: user.id,
          title: note.title,
          content: note.content,
          is_pinned: note.isPinned,
          is_archived: note.isArchived,
          color: note.color,
          tags: note.tags,
          reminder: note.reminder,
        }])
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        reminder: data.reminder ? new Date(data.reminder) : null,
        isPinned: data.is_pinned,
        isArchived: data.is_archived,
      };

      setNotes(prev => [newNote, ...prev]);
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: updates.title,
          content: updates.content,
          is_pinned: updates.isPinned,
          is_archived: updates.isArchived,
          color: updates.color,
          tags: updates.tags,
          reminder: updates.reminder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setNotes(prev =>
        prev.map(note =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        )
      );
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (reminderTimeouts[id]) {
        clearTimeout(reminderTimeouts[id]);
        const { [id]: _, ...rest } = reminderTimeouts;
        setReminderTimeouts(rest);
      }

      setNotes(prev => prev.filter(note => note.id !== id));
      setSelectedNotes(prev => prev.filter(noteId => noteId !== id));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const toggleNoteSelection = (id: string) => {
    setSelectedNotes(prev => 
      prev.includes(id) 
        ? prev.filter(noteId => noteId !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedNotes = async () => {
    if (selectedNotes.length === 0) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .in('id', selectedNotes);

      if (error) throw error;

      selectedNotes.forEach(id => {
        if (reminderTimeouts[id]) {
          clearTimeout(reminderTimeouts[id]);
        }
      });
      
      const newTimeouts = { ...reminderTimeouts };
      selectedNotes.forEach(id => delete newTimeouts[id]);
      setReminderTimeouts(newTimeouts);

      setNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)));
      toast.success(`${selectedNotes.length} notes deleted successfully`);
      setSelectedNotes([]);
    } catch (error) {
      console.error('Error deleting selected notes:', error);
      toast.error('Failed to delete selected notes');
    }
  };

  const pinNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.isPinned })
        .eq('id', id);

      if (error) throw error;

      setNotes(prev =>
        prev.map(note =>
          note.id === id
            ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
            : note
        )
      );
      toast.success('Note pinned successfully');
    } catch (error) {
      console.error('Error pinning note:', error);
      toast.error('Failed to pin note');
    }
  };

  const archiveNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_archived: !note.isArchived })
        .eq('id', id);

      if (error) throw error;

      setNotes(prev =>
        prev.map(note =>
          note.id === id
            ? { ...note, isArchived: !note.isArchived, updatedAt: new Date() }
            : note
        )
      );
      toast.success('Note archived successfully');
    } catch (error) {
      console.error('Error archiving note:', error);
      toast.error('Failed to archive note');
    }
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const exportNotes = () => {
    const exportableNotes = notes.map(({ id, ...rest }) => rest);
    const dataStr = JSON.stringify(exportableNotes, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `notes-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Notes exported successfully');
  };

  const importNotes = async (importedNotes: Omit<Note, 'id'>[]) => {
    if (!user) return;

    try {
      const notesToInsert = importedNotes.map(note => ({
        user_id: user.id,
        title: note.title,
        content: note.content,
        is_pinned: note.isPinned,
        is_archived: note.isArchived,
        color: note.color,
        tags: note.tags,
        reminder: note.reminder,
      }));

      const { data, error } = await supabase
        .from('notes')
        .insert(notesToInsert)
        .select();

      if (error) throw error;

      const formattedNotes = data.map(note => ({
        ...note,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
        reminder: note.reminder ? new Date(note.reminder) : null,
        isPinned: note.is_pinned,
        isArchived: note.is_archived,
      }));

      setNotes(prev => [...formattedNotes, ...prev]);
      toast.success(`Successfully imported ${importedNotes.length} notes`);
    } catch (error) {
      console.error('Error importing notes:', error);
      toast.error('Failed to import notes');
    }
  };

  const value: NotesContextType = {
    notes,
    selectedNotes,
    setSelectedNotes,
    toggleNoteSelection,
    deleteSelectedNotes,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    activeTag,
    setActiveTag,
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection,
    getAllTags,
    exportNotes,
    importNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};