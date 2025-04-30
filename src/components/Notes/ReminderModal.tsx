import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import Modal from '../UI/Modal';
import { useNotes } from '../../context/NotesContext';
import { Note } from '../../types';
import { toast } from 'react-toastify';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, note }) => {
  const { updateNote } = useNotes();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (note.reminder) {
      const date = new Date(note.reminder);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    }
    return format(new Date(), "yyyy-MM-dd'T'HH:mm");
  });

  const handleSetReminder = () => {
    const reminderDate = new Date(selectedDate);
    if (reminderDate < new Date()) {
      toast.error('Please select a future date and time');
      return;
    }

    updateNote(note.id, { reminder: reminderDate });
    toast.success('Reminder set successfully');
    onClose();
  };

  const handleRemoveReminder = () => {
    updateNote(note.id, { reminder: null });
    toast.success('Reminder removed');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Reminder"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Bell className="h-5 w-5" />
          <span>Choose when to be reminded</span>
        </div>

        <input
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />

        <div className="flex justify-end space-x-3 pt-4">
          {note.reminder && (
            <button
              onClick={handleRemoveReminder}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Remove Reminder
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSetReminder}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Set Reminder
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReminderModal;