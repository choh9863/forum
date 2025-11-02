import { fileService } from '../../services/fileService';

interface FilePreviewProps {
  file: any;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = fileService.isImage(file.mimeType);
  const isVideo = fileService.isVideo(file.mimeType);
  const fileUrl = fileService.getFileUrl(file.path);

  return (
    <div className="relative group">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {isImage && (
          <img
            src={fileUrl}
            alt={file.originalName}
            className="w-full h-full object-cover"
          />
        )}

        {isVideo && (
          <video
            src={fileUrl}
            className="w-full h-full object-cover"
          />
        )}

        {!isImage && !isVideo && (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="mt-1">
        <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
        <p className="text-xs text-gray-500">{fileService.formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}
