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

  useEffect(() => {
    console.log('ProductImageModal - isOpen:', isOpen);
    console.log('ProductImageModal - product:', product);
  }, [isOpen, product]);

  if (!product) {
    console.log('ProductImageModal: product is null');
    return null;
  }

  // Resimleri al - images array'i varsa onu kullan, yoksa imageUrl'i kullan
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  console.log('ProductImageModal - product:', product);
  console.log('ProductImageModal - images:', images);
  console.log('ProductImageModal - currentImageIndex:', currentImageIndex);

  const currentImage = images[currentImageIndex] || null;
  
  console.log('ProductImageModal - currentImage:', currentImage);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  console.log('ProductImageModal - Rendering Popup with isOpen:', isOpen);

  return (
    <Popup
      visible={isOpen}
      onHiding={onClose}
      showTitle={true}
      title="Ürün Resimleri"
      width={800}
      height={600}
      showCloseButton={true}
      dragEnabled={true}
      closeOnOutsideClick={true}
      position="center"
      zIndex={10000}
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
              {currentImage.startsWith('/uploads/') || currentImage.startsWith('http://localhost') ? (
                // Local dosyalar için normal img tag kullan
                <img
                  src={currentImage}
                  alt={product.productName || 'Ürün Resmi'}
                  className="object-contain rounded max-w-full max-h-[400px]"
                  onError={(e) => {
                    console.error('Image load error:', currentImage);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'text-red-500 text-center p-4';
                      errorDiv.textContent = 'Resim yüklenemedi';
                      target.parentElement.appendChild(errorDiv);
                    }
                  }}
                />
              ) : (
                // External URL'ler için Next.js Image component
                <Image
                  src={currentImage}
                  alt={product.productName || 'Ürün Resmi'}
                  width={600}
                  height={400}
                  className="object-contain rounded"
                  onError={(e) => {
                    console.error('Image load error:', currentImage);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'text-red-500 text-center p-4';
                      errorDiv.textContent = 'Resim yüklenemedi';
                      target.parentElement.appendChild(errorDiv);
                    }
                  }}
                />
              )}
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

