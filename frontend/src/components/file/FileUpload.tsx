import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { fileService } from '../../services/fileService';
import FilePreview from './FilePreview';

interface FileUploadProps {
  onUpload: (files: any[]) => void;
  onRemove: (fileId: string) => void;
  uploadedFiles: any[];
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
}

export default function FileUpload({
  onUpload,
  onRemove,
  uploadedFiles,
  accept = 'image/*,video/*',
  maxSize = 10,
  maxFiles = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    setError('');

    // Check max files
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`);
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(file => fileService.uploadFile(file as any));
      const uploadedFiles = await Promise.all(uploadPromises);
      onUpload(uploadedFiles);
    } catch (error) {
      console.error('File upload failed:', error);
      setError('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="mt-2 text-sm text-gray-600">
          {isUploading ? '업로드 중...' : '파일을 드래그하거나 클릭하여 업로드'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          최대 {maxFiles}개, 파일당 {maxSize}MB 이하
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={() => onRemove(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
