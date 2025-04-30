import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, Grid, List, Plus, SlidersHorizontal, LogOut, User, Settings } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DropdownMenu from '../UI/DropdownMenu';
import Modal from '../UI/Modal';
import NoteEditor from '../Notes/NoteEditor';
import ProfileModal from '../Profile/ProfileModal';
import { SortOption, SortDirection } from '../../types';

interface SortMenuItem {
  label: string;
  value: SortOption;
}

const Header: React.FC = () => {
  const { 
    setSearchTerm, 
    viewMode, 
    setViewMode, 
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection,
    addNote
  } = useNotes();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const sortOptions: SortMenuItem[] = [
    { label: 'Date Modified', value: 'updatedAt' },
    { label: 'Date Created', value: 'createdAt' },
    { label: 'Title', value: 'title' }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      setIsNewNoteModalOpen(true);
    }
  };

  const handleCreateNote = (note: { title: string; content: string }) => {
    addNote({
      ...note,
      isPinned: false,
      isArchived: false,
      color: 'default',
      tags: [],
    });
    setIsNewNoteModalOpen(false);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              NoteVault
            </h1>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
            <div className={`relative rounded-md shadow-sm transition-all ${
              isSearchFocused ? 'ring-2 ring-indigo-500' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes... (Ctrl+F)"
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Sort options"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
              
              {dropdownOpen && (
                <DropdownMenu
                  items={sortOptions.map(option => ({
                    label: option.label,
                    onClick: () => setSortOption(option.value),
                    isActive: sortOption === option.value
                  }))}
                  footerItem={{
                    label: `Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`,
                    onClick: toggleSortDirection
                  }}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsNewNoteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              aria-label="Create new note"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">New Note</span>
            </button>

            {/* Profile Section */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden md:inline-block text-sm truncate max-w-[120px]">
                  {username}
                </span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Signed in as<br />
                    <span className="font-medium truncate block">{username}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </button>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Note Modal */}
      {isNewNoteModalOpen && (
        <Modal
          isOpen={isNewNoteModalOpen}
          onClose={() => setIsNewNoteModalOpen(false)}
          title="Create New Note"
          size="xl"
        >
          <NoteEditor
            isNew={true}
            onSave={handleCreateNote}
            onClose={() => setIsNewNoteModalOpen(false)}
          />
        </Modal>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Profile Settings"
          size="md"
        >
          <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
        </Modal>
      )}
    </header>
  );
};

export default Header;