import React, { useState, useEffect } from 'react';
import { Pin, Trash2, Archive, Edit, MoreVertical, Tag, X, Check, Share2, Bell, BellOff } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { Note, ViewMode } from '../../types';
import { formatDate, getColorClass, countWords, formatReminderDate } from '../../utils/helpers';
import Modal from '../UI/Modal';
import NoteEditor from './NoteEditor';
import ShareNote from './ShareNote';
import { toast } from 'react-toastify';
import ReminderModal from './ReminderModal';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, viewMode }) => {
  const { 
    pinNote, 
    archiveNote, 
    deleteNote,
    selectedNotes,
    toggleNoteSelection,
    updateNote
  } = useNotes();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const isSelected = selectedNotes.includes(note.id);

  // Check for due reminders
  useEffect(() => {
    if (note.reminder && new Date(note.reminder) <= new Date()) {
      toast.info(`Reminder: ${note.title}`, {
        autoClose: false,
        onClick: () => setIsEditModalOpen(true),
      });
      // Clear the reminder after showing notification
      updateNote(note.id, { reminder: null });
    }
  }, [note.reminder, note.title]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handlePinClick = () => {
    pinNote(note.id);
    setIsMenuOpen(false);
  };

  const handleArchiveClick = () => {
    archiveNote(note.id);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleReminderClick = () => {
    setIsReminderModalOpen(true);
    setIsMenuOpen(false);
  };

  const confirmDelete = () => {
    deleteNote(note.id);
    setIsDeleteModalOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      toggleNoteSelection(note.id);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div 
        className={`
          ${getColorClass(note.color)} 
          border border-gray-200 dark:border-gray-700 
          rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow
          ${viewMode === 'list' ? 'flex' : ''}
          ${isSelected ? 'ring-2 ring-indigo-500' : ''}
          relative
        `}
      >
        {/* Selection Checkbox */}
        <div 
          className="absolute top-2 left-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            toggleNoteSelection(note.id);
          }}
        >
          <div className={`
            w-5 h-5 rounded border-2 cursor-pointer
            ${isSelected 
              ? 'bg-indigo-500 border-indigo-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
            flex items-center justify-center
            hover:border-indigo-500 transition-colors
          `}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>

        <div 
          className={`
            relative p-4 cursor-pointer flex flex-col
            ${viewMode === 'list' ? 'flex-1' : 'h-full'}
          `}
          onClick={handleCardClick}
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 ml-6">
              {note.title || 'Untitled Note'}
            </h3>
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div className="fixed z-50 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handlePinClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    {note.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={handleArchiveClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {note.isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    onClick={handleReminderClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {note.reminder ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                    {note.reminder ? 'Remove Reminder' : 'Set Reminder'}
                  </button>
                  <button
                    onClick={handleShareClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card Content */}
          <div className="flex-1">
            <p className={`
              text-gray-600 dark:text-gray-400 whitespace-pre-line
              ${viewMode === 'grid' ? 'line-clamp-6' : 'line-clamp-2'}
            `}>
              {truncateContent(note.content, viewMode === 'grid' ? 200 : 120)}
            </p>
          </div>

          {/* Card Footer */}
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <span>{formatDate(note.updatedAt)}</span>
                <span className="mx-1">•</span>
                <span>{countWords(note.content)} words</span>
                {note.reminder && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="flex items-center">
                      <Bell className="h-3 w-3 mr-1" />
                      {formatReminderDate(note.reminder)}
                    </span>
                  </>
                )}
              </div>
              {note.isPinned && (
                <Pin className="h-3 w-3 text-indigo-500" />
              )}
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap mt-2 gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={note.title || 'Edit Note'}
          size="xl"
        >
          <NoteEditor
            note={note}
            onClose={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Note"
          size="md"
        >
          <ShareNote note={note} onClose={() => setIsShareModalOpen(false)} />
        </Modal>
      )}

      {/* Reminder Modal */}
      {isReminderModalOpen && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          note={note}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Note"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NoteCard;