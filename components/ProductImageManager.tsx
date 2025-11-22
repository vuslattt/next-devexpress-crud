'use client';

import { useState, useEffect, useRef } from 'react';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import Image from 'next/image';

interface ProductImageManagerProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (images: string[]) => void;
}

const placeholderImage = '/placeholder-image.png';

export default function ProductImageManager({ images, isOpen, onClose, onSave }: ProductImageManagerProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setImageUrls(images || []);
    }
  }, [isOpen, images]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (response.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Upload failed for file:', file.name, data.error);
        }
      } catch (error) {
        console.error('Upload error for file:', file.name, error);
      }
    }

    setImageUrls((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(imageUrls);
    // onClose() çağrılmayacak, edit modu açık kalacak
    // Kullanıcı DataGrid'in Save butonuna basacak
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Popup
      visible={isOpen}
      onHiding={handleCancel}
      showTitle={true}
      title="Resim Yönetimi"
      width={700}
      height={600}
      showCloseButton={true}
      dragEnabled={false}
      closeOnOutsideClick={false}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Cihazdan Resim Yükle</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            id="image-upload"
          />
          <Button
            text={uploading ? "Yükleniyor..." : "Dosya Seç"}
            icon="upload"
            onClick={() => fileInputRef.current?.click()}
            stylingMode="contained"
            type="default"
            disabled={uploading}
          />
          {uploading && (
            <span className="text-sm text-gray-600 self-center">Yükleniyor...</span>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Resimler ({imageUrls.length})</label>
          {imageUrls.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz resim eklenmedi</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative border rounded p-2">
                  <div className="relative w-full h-32 mb-2 bg-gray-100 rounded">
                    <Image
                      src={url}
                      alt={`Resim ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate flex-1 mr-2">{url.split('/').pop()}</span>
                    <Button
                      icon="trash"
                      onClick={() => handleRemoveImage(index)}
                      stylingMode="contained"
                      type="danger"
                      height={28}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            text="İptal"
            onClick={handleCancel}
            stylingMode="outlined"
            type="default"
          />
          <Button
            text="Kaydet"
            onClick={handleSave}
            stylingMode="contained"
            type="default"
          />
        </div>
      </div>
    </Popup>
  );
}

