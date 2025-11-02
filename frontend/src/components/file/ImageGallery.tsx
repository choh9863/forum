import { useState } from 'react';
import { fileService } from '../../services/fileService';
import Modal from '../common/Modal';

interface ImageGalleryProps {
  images: any[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={fileService.getFileUrl(image.path)}
              alt={image.originalName}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <Modal
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          title={selectedImage.originalName}
        >
          <div className="relative">
            <img
              src={fileService.getFileUrl(selectedImage.path)}
              alt={selectedImage.originalName}
              className="w-full h-auto"
            />

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex! - 1))}
                disabled={selectedIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                이전
              </button>

              <span className="text-sm text-gray-600">
                {selectedIndex! + 1} / {images.length}
              </span>

              <button
                onClick={() => setSelectedIndex(Math.min(images.length - 1, selectedIndex! + 1))}
                disabled={selectedIndex === images.length - 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
