export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  color: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  reminder?: Date | null;
}

export type ViewMode = 'grid' | 'list';
export type ColorOption = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
export type SortOption = 'updatedAt' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface NotesContextType {
  notes: Note[];
  selectedNotes: string[];
  setSelectedNotes: (ids: string[]) => void;
  toggleNoteSelection: (id: string) => void;
  deleteSelectedNotes: () => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string) => void;
  archiveNote: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  getAllTags: () => string[];
  exportNotes: () => void;
  importNotes: (importedNotes: Note[]) => void;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}