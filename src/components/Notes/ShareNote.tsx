import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Note } from '../../types';
import { toast } from 'react-toastify';

interface ShareNoteProps {
  note: Note;
  onClose: () => void;
}

const ShareNote: React.FC<ShareNoteProps> = ({ note }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create a shareable version of the note
  const shareableNote = {
    title: note.title,
    content: note.content,
    tags: note.tags,
    createdAt: note.createdAt,
  };

  const shareableText = `${note.title}\n\n${note.content}`;
  const shareableJson = JSON.stringify(shareableNote, null, 2);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareableText);
      setCopied(true);
      toast.success('Note content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(shareableJson);
      setCopied(true);
      toast.success('Note data copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Share Options */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Share as Plain Text
          </h3>
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy Content
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Share as JSON
          </h3>
          <button
            onClick={handleCopyJson}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy Data
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Share via QR Code
          </h3>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        </div>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={shareableJson}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>
      )}

      {/* Preview */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            {note.title || 'Untitled Note'}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
            {note.content.length > 200
              ? `${note.content.substring(0, 200)}...`
              : note.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareNote;