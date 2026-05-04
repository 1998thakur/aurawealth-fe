'use client';

import { useRef, useState } from 'react';
import { adminCardsApi } from '../../api/adminCards';

interface Props {
  value: string;
  onChange: (url: string) => void;
  /**
   * Edit mode: if cardId is provided, the file is uploaded immediately on selection
   * and onChange is called with the returned public URL.
   */
  cardId?: string;
  /**
   * Create mode: if provided (without cardId), called when the user picks a file
   * so the parent can hold it and upload after card creation.
   * Pass null when the file is cleared.
   */
  onFileSelected?: (file: File | null) => void;
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

export function CardImageUpload({ value, onChange, cardId, onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  // Local blob URL used for preview in deferred (create) mode
  const [localPreview, setLocalPreview] = useState('');

  const previewSrc = value || localPreview;

  async function handleFile(file: File) {
    setError('');

    if (cardId) {
      // Immediate upload — edit page
      setUploading(true);
      try {
        const url = await adminCardsApi.uploadImage(cardId, file);
        onChange(url);
        setLocalPreview('');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    } else {
      // Deferred — create page: hold file in parent, show local preview
      const blobUrl = URL.createObjectURL(file);
      setLocalPreview(blobUrl);
      onFileSelected?.(file);
    }
  }

  function handleRemove() {
    onChange('');
    setLocalPreview('');
    onFileSelected?.(null);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Card Image</label>

      {previewSrc && (
        <div className="w-48 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={previewSrc}
            alt="Card preview"
            className="max-w-full max-h-full object-contain p-2"
          />
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading…' : previewSrc ? 'Replace Image' : 'Upload Image'}
        </button>

        {previewSrc && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Or paste image URL directly</label>
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setLocalPreview('');
            onFileSelected?.(null);
          }}
          placeholder="https://…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
