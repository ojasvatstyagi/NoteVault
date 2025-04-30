import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  footerItem?: DropdownItem;
  onClose: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, footerItem, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all z-10"
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="group flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            role="menuitem"
          >
            <span>{item.label}</span>
            {item.isActive && <Check className="h-4 w-4 text-indigo-500" />}
          </button>
        ))}
        
        {footerItem && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              onClick={() => {
                footerItem.onClick();
                onClose();
              }}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
            >
              {footerItem.label}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;