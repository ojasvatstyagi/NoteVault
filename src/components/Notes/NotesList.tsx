import React, { useMemo } from 'react';
import { useNotes } from '../../context/NotesContext';
import NoteCard from './NoteCard';
import { Trash2 } from 'lucide-react';
import { Note } from '../../types';

const NotesList: React.FC = () => {
  const { 
    notes, 
    searchTerm, 
    viewMode, 
    activeTag,
    sortOption,
    sortDirection,
    selectedNotes,
    deleteSelectedNotes
  } = useNotes();

  const filteredNotes = useMemo(() => {
    let filtered = notes.filter((note) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      );
    });

    if (activeTag) {
      if (activeTag === 'archived') {
        filtered = filtered.filter((note) => note.isArchived);
      } else if (activeTag.startsWith('reminder-')) {
        // Handle reminder-specific filtering
        const noteId = activeTag.replace('reminder-', '');
        filtered = filtered.filter((note) => note.id === noteId);
      } else {
        filtered = filtered.filter((note) => 
          note.tags.includes(activeTag) && !note.isArchived
        );
      }
    } else {
      filtered = filtered.filter((note) => !note.isArchived);
    }

    return filtered.sort((a, b) => {
      // Only apply pinned sorting when not in archived view and not in reminder view
      if (!activeTag?.startsWith('reminder-') && activeTag !== 'archived') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortOption === 'title') {
        const comparison = a.title.localeCompare(b.title);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const aDate = sortOption === 'createdAt' ? a.createdAt : a.updatedAt;
        const bDate = sortOption === 'createdAt' ? b.createdAt : b.updatedAt;
        const comparison = bDate.getTime() - aDate.getTime();
        return sortDirection === 'asc' ? -comparison : comparison;
      }
    });
  }, [notes, searchTerm, activeTag, sortOption, sortDirection]);

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);
  const showPinnedSection = pinnedNotes.length > 0 && !activeTag?.startsWith('reminder-') && activeTag !== 'archived';

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">No notes found</p>
        <p className="text-sm">
          {searchTerm 
            ? 'Try a different search term'
            : activeTag
              ? activeTag.startsWith('reminder-')
                ? 'This note no longer exists'
                : activeTag === 'archived'
                ? 'No archived notes'
                : `No notes with the tag "${activeTag}"`
              : 'Create a new note to get started'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedNotes.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={deleteSelectedNotes}
            className="flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Display all notes in a single section when in reminder or archived view */}
      {(activeTag?.startsWith('reminder-') || activeTag === 'archived') ? (
        <div className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'grid-cols-1 gap-2'
        }`}>
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <>
          {/* Show pinned section only in normal views */}
          {showPinnedSection && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Pinned
              </h2>
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'grid-cols-1 gap-2'
              }`}>
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} />
                ))}
              </div>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
              {showPinnedSection && (
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Other Notes
                </h2>
              )}
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'grid-cols-1 gap-2'
              }`}>
                {unpinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesList;