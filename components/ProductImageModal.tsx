'use client';

import { useState, useEffect } from 'react';
import { Popup } from 'devextreme-react/popup';
import { SelectBox } from 'devextreme-react/select-box';
import { Button } from 'devextreme-react/button';
import Image from 'next/image';

interface ProductImageModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const imageTypes = ['Mekanik Resmi', 'Ürün Resmi', 'Montaj Resmi'];

export default function ProductImageModal({ product, isOpen, onClose }: ProductImageModalProps) {
  const [selectedImageType, setSelectedImageType] = useState('Mekanik Resmi');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ürün değiştiğinde veya modal açıldığında index'i sıfırla
  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, product]);

  if (!product) return null;

  // Resimleri al - images array'i varsa onu kullan, yoksa imageUrl'i kullan
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  const currentImage = images[currentImageIndex] || null;

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Popup
      visible={isOpen}
      onHiding={onClose}
      showTitle={true}
      title="Resim"
      width={800}
      height={600}
      showCloseButton={true}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Resim Türü</label>
          <SelectBox
            dataSource={imageTypes}
            value={selectedImageType}
            onValueChange={setSelectedImageType}
            width="100%"
          />
        </div>
        <div className="relative flex justify-center items-center bg-gray-100 rounded p-4 min-h-[400px]">
          {currentImage ? (
            <>
              {images.length > 1 && (
                <Button
                  icon="chevronleft"
                  onClick={handlePrevious}
                  stylingMode="contained"
                  className="absolute left-2 z-10"
                />
              )}
              <Image
                src={currentImage}
                alt={product.productName || 'Ürün Resmi'}
                width={600}
                height={400}
                className="object-contain rounded"
              />
              {images.length > 1 && (
                <Button
                  icon="chevronright"
                  onClick={handleNext}
                  stylingMode="contained"
                  className="absolute right-2 z-10"
                />
              )}
            </>
          ) : (
            <p className="text-gray-500">Resim bulunamadı</p>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {images.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Resim ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Popup>
  );
}

