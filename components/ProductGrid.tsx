'use client';

import { useState, useEffect, useRef } from 'react';
import DataGrid, {
  Column,
  FilterRow,
  HeaderFilter,
  SearchPanel,
  Toolbar,
  Item,
  Editing,
  Paging,
  Pager,
} from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';
import CustomStore from 'devextreme/data/custom_store';
import { hasManagementPermission } from '@/lib/permissions';
import ProductImageManager from './ProductImageManager';

const surfaces = ['MAT', 'PARLAK', 'DOĞAL', 'BOYALI'];
const colors = ['RAL 9003', 'RAL 9010', 'RAL 7016', 'BRONZ', 'GÜMÜŞ'];
const alloys = ['6061', '6063', '7050', '7075'];
const hardness = ['F18', 'F19', 'F20', 'T4', 'T6'];
const priceUnits = ['KILOGRAM', 'ADET', 'METRE', 'M2', 'M3'];

interface ProductGridProps {
  orderId: number;
  onImageClick: (product: any) => void;
}

export default function ProductGrid({ orderId, onImageClick }: ProductGridProps) {
  const [dataSource, setDataSource] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  const gridRef = useRef<any>(null);
  const gridInstanceRef = useRef<any>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [currentEditingRow, setCurrentEditingRow] = useState<any>(null);
  const rowImagesMapRef = useRef<Map<number | string, string[]>>(new Map());
  const editingRowKeyRef = useRef<number | null>(null);

  useEffect(() => {
    setCanEdit(hasManagementPermission());
    if (!orderId) return;

    const store = new CustomStore({
      key: 'id',
      load: async () => {
        const response = await fetch(`/api/orders/${orderId}/products`);
        const data = await response.json();
        return data;
      },
      insert: async (values) => {
        // rowImagesMapRef'ten images'i kontrol et ve ekle
        const tempId = values.tempId;
        const images = tempId ? rowImagesMapRef.current.get(tempId) : null;
        
        const payload = { ...values };
        
        // Eğer rowImagesMapRef'te images varsa, onu kullan
        if (images !== undefined && images !== null) {
          payload.images = images;
          if (tempId) {
            rowImagesMapRef.current.delete(tempId);
          }
        } else if (!payload.images) {
          // Eğer values'da images yoksa ve ref'te de yoksa, boş array kullan
          payload.images = [];
        }
        
        // tempId'yi payload'dan çıkar (API'ye göndermeye gerek yok)
        delete payload.tempId;
        
        console.log('CustomStore insert - values:', values);
        console.log('CustomStore insert - images from ref:', images);
        console.log('CustomStore insert - payload:', payload);
        console.log('CustomStore insert - payload.images:', payload.images);
        
        const response = await fetch(`/api/orders/${orderId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log('CustomStore insert - result:', result);
        console.log('CustomStore insert - result.images:', result.images);
        return result;
      },
      update: async (key, values) => {
        // rowImagesMapRef'ten images'i kontrol et ve ekle
        const images = rowImagesMapRef.current.get(key);
        const payload = { id: key, ...values };
        
        console.log('=== CustomStore update START ===');
        console.log('CustomStore update - key:', key);
        console.log('CustomStore update - values:', values);
        console.log('CustomStore update - values.images:', values.images);
        console.log('CustomStore update - images from ref:', images);
        console.log('CustomStore update - payload before:', JSON.stringify(payload));
        
        // Eğer rowImagesMapRef'te images varsa, onu kullan (öncelikli)
        if (images !== undefined && images !== null) {
          payload.images = images;
          console.log('CustomStore update - Using images from ref:', images);
          rowImagesMapRef.current.delete(key);
        } else if (values.images !== undefined && values.images !== null) {
          // Eğer values'da images varsa, onu kullan
          payload.images = values.images;
          console.log('CustomStore update - Using images from values:', values.images);
        } else if (!payload.images) {
          // Eğer hiçbirinde yoksa, boş array kullan
          payload.images = [];
          console.log('CustomStore update - Using empty array for images');
        }
        
        console.log('CustomStore update - payload after:', JSON.stringify(payload));
        console.log('CustomStore update - payload.images:', payload.images);
        
        const response = await fetch(`/api/orders/${orderId}/products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log('CustomStore update - result:', result);
        console.log('CustomStore update - result.images:', result.images);
        console.log('=== CustomStore update END ===');
        return result;
      },
      remove: async (key) => {
        await fetch(`/api/orders/${orderId}/products?productId=${key}`, {
          method: 'DELETE',
        });
      },
    });
    setDataSource(store);
  }, [orderId]);

  const handleImageClick = (product: any) => {
    onImageClick(product);
  };

  if (!dataSource) {
    return <div className="p-4">Yükleniyor...</div>;
  }

  return (
    <div className={`p-4 product-grid-container product-grid-${orderId}`} style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Ürünler</h3>
        {canEdit && (
          <Button
            text="Yeni"
            icon="plus"
            onClick={() => {
              if (!canEdit) return;
              
              // Önce gridInstanceRef'i kontrol et
              if (gridInstanceRef.current) {
                try {
                  if (typeof gridInstanceRef.current.addRow === 'function') {
                    gridInstanceRef.current.addRow();
                    return;
                  }
                } catch (error) {
                  console.error('Add row via instance error:', error);
                }
              }
              
              // gridRef üzerinden instance'a eriş
              if (gridRef.current) {
                const gridElement = gridRef.current as any;
                if (gridElement && gridElement.instance) {
                  try {
                    if (typeof gridElement.instance.addRow === 'function') {
                      gridElement.instance.addRow();
                      return;
                    }
                  } catch (error) {
                    console.error('Add row via gridRef error:', error);
                  }
                }
              }
              
              // Son çare: Toolbar'daki addButton'u bul ve tıkla
              setTimeout(() => {
                // ProductGrid container'ını orderId ile bul
                const productContainer = document.querySelector(`.product-grid-${orderId}`);
                if (productContainer) {
                  // Container içindeki DataGrid'i bul
                  const grid = productContainer.querySelector('.dx-datagrid');
                  if (grid) {
                    const toolbar = grid.querySelector('.dx-datagrid-toolbar');
                    if (toolbar) {
                      // Toolbar içindeki addButton'u bul - farklı selector'lar dene
                      let addButton = toolbar.querySelector('.dx-datagrid-addrow-button') as HTMLElement;
                      
                      // Bulunamazsa, tüm butonları kontrol et
                      if (!addButton) {
                        const buttons = toolbar.querySelectorAll('button, .dx-button, [role="button"], .dx-toolbar-item');
                        for (let i = 0; i < buttons.length; i++) {
                          const btn = buttons[i] as HTMLElement;
                          const ariaLabel = btn.getAttribute('aria-label') || '';
                          const title = btn.getAttribute('title') || '';
                          const className = btn.className || '';
                          const dataHint = btn.getAttribute('data-hint') || '';
                          const innerText = btn.innerText || '';
                          
                          // Add butonunu bul
                          if ((ariaLabel.toLowerCase().includes('add') || 
                               ariaLabel.toLowerCase().includes('ekle') ||
                               title.toLowerCase().includes('add') ||
                               title.toLowerCase().includes('ekle') ||
                               dataHint.toLowerCase().includes('add') ||
                               dataHint.toLowerCase().includes('ekle') ||
                               innerText.toLowerCase().includes('add') ||
                               innerText.toLowerCase().includes('ekle') ||
                               className.includes('addrow') ||
                               className.includes('add-button') ||
                               className.includes('dx-datagrid-addrow')) &&
                              !btn.classList.contains('dx-state-disabled') &&
                              !btn.hasAttribute('disabled')) {
                            addButton = btn;
                            break;
                          }
                        }
                      }
                      
                      if (addButton && !addButton.classList.contains('dx-state-disabled')) {
                        addButton.click();
                        return;
                      }
                    }
                  }
                }
                
                // En son çare: Tüm sayfadaki toolbar'larda ara ve ProductGrid'e ait olanı bul
                const allToolbars = document.querySelectorAll('.dx-datagrid-toolbar');
                for (let i = 0; i < allToolbars.length; i++) {
                  const toolbar = allToolbars[i];
                  const parentGrid = toolbar.closest('.dx-datagrid');
                  if (parentGrid) {
                    const container = parentGrid.closest(`.product-grid-${orderId}`);
                    if (container) {
                      const addButton = toolbar.querySelector('.dx-datagrid-addrow-button, button[aria-label*="Add"], button[title*="Add"]') as HTMLElement;
                      if (addButton && !addButton.classList.contains('dx-state-disabled')) {
                        addButton.click();
                        return;
                      }
                    }
                  }
                }
              }, 200);
            }}
            stylingMode="contained"
            type="default"
            disabled={!canEdit}
            height={28}
          />
        )}
      </div>
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <DataGrid
          ref={gridRef}
          dataSource={dataSource}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          wordWrapEnabled={true}
          height="400px"
          width="100%"
          onInitialized={(e: any) => {
            if (gridRef.current) {
              (gridRef.current as any).instance = e.component;
            }
            gridInstanceRef.current = e.component;
          }}
        >
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} placeholder="Ara..." />
        <Toolbar>
          <Item name="addButton" />
          <Item name="editButton" />
          <Item name="deleteButton" />
          <Item name="searchPanel" />
        </Toolbar>
        <Editing
          mode="row"
          allowAdding={canEdit}
          allowUpdating={canEdit}
          allowDeleting={canEdit}
          onEditingStart={(e: any) => {
            // Edit modu başladığında row key'i kaydet
            editingRowKeyRef.current = e.key;
          }}
          onRowClick={(e: any) => {
            // Eğer modal açıksa, satıra tıklanınca edit modundan çıkmasını engelle
            if (isImageManagerOpen && editingRowKeyRef.current === e.key) {
              e.event.preventDefault();
            }
          }}
          onRowInserting={(e: any) => {
            // Yeni satır eklenirken images'i rowImagesMapRef'ten al
            const tempId = e.data.tempId;
            console.log('onRowInserting - tempId:', tempId);
            if (tempId) {
              const images = rowImagesMapRef.current.get(tempId);
              console.log('onRowInserting - images from ref:', images);
              if (images) {
                e.data.images = images;
                console.log('onRowInserting - Setting images:', images);
              } else {
                e.data.images = [];
              }
              // TempId'yi temizle
              rowImagesMapRef.current.delete(tempId);
            } else {
              e.data.images = [];
            }
            console.log('onRowInserting - e.data.images:', e.data.images);
          }}
          onRowUpdating={(e: any) => {
            // Satır güncellenirken images'i rowImagesMapRef'ten al
            const productId = e.key;
            const images = rowImagesMapRef.current.get(productId);
            console.log('=== onRowUpdating START ===');
            console.log('onRowUpdating - productId:', productId);
            console.log('onRowUpdating - images from ref:', images);
            console.log('onRowUpdating - e.newData before:', JSON.stringify(e.newData));
            console.log('onRowUpdating - e.oldData.images:', e.oldData.images);
            console.log('onRowUpdating - rowImagesMapRef size:', rowImagesMapRef.current.size);
            console.log('onRowUpdating - rowImagesMapRef keys:', Array.from(rowImagesMapRef.current.keys()));
            
            // Mutlaka images'i set et (rowImagesMapRef'te varsa onu kullan, yoksa eski images'i koru)
            if (images !== undefined && images !== null) {
              // rowImagesMapRef'te varsa onu kullan (mutlaka set et)
              e.newData.images = images;
              console.log('onRowUpdating - Setting images from ref:', images);
              // Güncelleme sonrası temizle (ama CustomStore update'de de kontrol edeceğiz)
              // rowImagesMapRef.current.delete(productId); // Silme, CustomStore'da da kontrol edeceğiz
            } else {
              // Eğer rowImagesMapRef'te yoksa, eski images'i koru (değişiklik yapılmamışsa)
              // Ama eğer e.newData.images zaten set edilmişse onu kullan
              if (e.newData.images === undefined || e.newData.images === null) {
                e.newData.images = e.oldData.images || [];
                console.log('onRowUpdating - Keeping old images:', e.newData.images);
              } else {
                console.log('onRowUpdating - Using existing e.newData.images:', e.newData.images);
              }
            }
            console.log('onRowUpdating - e.newData after:', JSON.stringify(e.newData));
            console.log('onRowUpdating - e.newData.images:', e.newData.images);
            console.log('=== onRowUpdating END ===');
          }}
          onInitNewRow={(e: any) => {
            // Yeni satır başlatılırken tempId oluştur
            e.data.tempId = Date.now();
          }}
        />
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} allowedPageSizes={[10, 20, 50]} />
        <Column dataField="productNo" caption="Ürün No" />
        <Column dataField="sequenceNo" caption="Sıra No" />
        <Column dataField="productName" caption="Ürün Adı" />
        <Column dataField="profile" caption="Profil" />
        <Column 
          dataField="surface" 
          caption="Yüzey"
          editCellRender={(data: any) => {
            return (
              <SelectBox
                dataSource={surfaces}
                value={data.value}
                onValueChange={(value) => data.setValue(value)}
              />
            );
          }}
        />
        <Column 
          dataField="color" 
          caption="Renk"
          editCellRender={(data: any) => {
            return (
              <SelectBox
                dataSource={colors}
                value={data.value}
                onValueChange={(value) => data.setValue(value)}
              />
            );
          }}
        />
        <Column 
          dataField="alloy" 
          caption="Alaşım"
          editCellRender={(data: any) => {
            return (
              <SelectBox
                dataSource={alloys}
                value={data.value}
                onValueChange={(value) => data.setValue(value)}
              />
            );
          }}
        />
        <Column 
          dataField="hardness" 
          caption="Sertlik"
          editCellRender={(data: any) => {
            return (
              <SelectBox
                dataSource={hardness}
                value={data.value}
                onValueChange={(value) => data.setValue(value)}
              />
            );
          }}
        />
        <Column dataField="companyProductNo" caption="Firma Ürün No" />
        <Column dataField="profileNo" caption="Profil No" />
        <Column dataField="weight" caption="Gramaj" />
        <Column
          dataField="insulationAssembly"
          caption="Yalıtım/Montaj"
          dataType="boolean"
        />
        <Column dataField="length" caption="Boy" />
        <Column dataField="quantity" caption="Adet" />
        <Column dataField="amount" caption="Miktar" />
        <Column 
          dataField="priceUnit" 
          caption="Fiyat Birimi"
          editCellRender={(data: any) => {
            return (
              <SelectBox
                dataSource={priceUnits}
                value={data.value}
                onValueChange={(value) => data.setValue(value)}
              />
            );
          }}
        />
        <Column
          dataField="images"
          caption="Resim"
          allowEditing={true}
          cellRender={(data: any) => {
            const images = data.data.images || [];
            return (
              <div className="flex gap-1">
                <Button
                  text={images.length > 0 ? `Görüntüle (${images.length})` : "Görüntüle"}
                  icon="image"
                  onClick={() => handleImageClick(data.data)}
                  stylingMode="outlined"
                  height={28}
                />
              </div>
            );
          }}
          editCellRender={(data: any) => {
            const productId = data.data.id || data.data.tempId;
            // Önce rowImagesMapRef'ten kontrol et, yoksa data'dan al
            let currentImages = rowImagesMapRef.current.get(productId);
            if (!currentImages) {
              currentImages = data.data.images || [];
              // İlk kez edit moduna girildiğinde mevcut resimleri kaydet
              if (productId && currentImages.length > 0) {
                rowImagesMapRef.current.set(productId, [...currentImages]);
              }
            }
            
            return (
              <div className="flex items-center gap-2">
                <Button
                  text={currentImages.length > 0 ? `Resimler (${currentImages.length})` : "Resim Ekle"}
                  icon="image"
                  onClick={() => {
                    // Edit modunu korumak için row key'i kaydet
                    const productId = data.data.id || data.data.tempId;
                    editingRowKeyRef.current = productId;
                    
                    setCurrentEditingRow(data);
                    setEditingImages(currentImages);
                    setIsImageManagerOpen(true);
                  }}
                  stylingMode="contained"
                  height={28}
                />
              </div>
            );
          }}
          setCellValue={(rowData: any, value: any) => {
            console.log('setCellValue called - rowData:', rowData);
            console.log('setCellValue called - value:', value);
            // Bu metod çağrıldığında resimleri hem data'ya hem de rowImagesMapRef'e kaydet
            if (rowData) {
              // rowData.data varsa onu kullan, yoksa rowData'nın kendisini kullan
              const data = rowData.data || rowData;
              const productId = data.id || data.tempId || editingRowKeyRef.current;
              
              if (data) {
                data.images = value;
              }
              
              // rowImagesMapRef'e de kaydet
              if (productId) {
                rowImagesMapRef.current.set(productId, value);
                console.log('setCellValue - Saved to rowImagesMapRef, productId:', productId, 'images:', value);
              } else {
                console.warn('setCellValue - No productId found! rowData:', rowData);
              }
            } else {
              // rowData yoksa, editingRowKeyRef'ten productId'yi al
              const productId = editingRowKeyRef.current;
              if (productId) {
                rowImagesMapRef.current.set(productId, value);
                console.log('setCellValue - Saved to rowImagesMapRef using editingRowKeyRef, productId:', productId, 'images:', value);
              }
            }
          }}
        />
        </DataGrid>
      </div>
      
      <ProductImageManager
        images={editingImages}
        isOpen={isImageManagerOpen}
        onClose={() => {
          setIsImageManagerOpen(false);
          setCurrentEditingRow(null);
        }}
        onSave={(images: string[]) => {
          if (currentEditingRow) {
            const productId = currentEditingRow.data.id || currentEditingRow.data.tempId;
            if (productId) {
              // Resimleri rowImagesMapRef'e kaydet
              rowImagesMapRef.current.set(productId, images);
              
              // DataGrid'deki data'yı da güncelle (hemen görünmesi için)
              if (currentEditingRow.data) {
                currentEditingRow.data.images = images;
              }
              
              // setCellValue ile de set et (DataGrid'e bildir - bu önemli!)
              if (currentEditingRow.setValue) {
                currentEditingRow.setValue(images);
              }
              
              // DataGrid instance'ı üzerinden de güncelle
              if (gridInstanceRef.current && productId) {
                try {
                  const rowIndex = gridInstanceRef.current.getRowIndexByKey(productId);
                  if (rowIndex >= 0) {
                    const rowData = gridInstanceRef.current.getVisibleRows()[rowIndex];
                    if (rowData && rowData.data) {
                      rowData.data.images = images;
                    }
                  }
                } catch (error) {
                  console.error('ProductImageManager onSave - Error updating via instance:', error);
                }
              }
            }
          }
          // Modal'ı kapat
          setIsImageManagerOpen(false);
          
          // Edit modunun açık kalmasını sağla
          if (editingRowKeyRef.current && gridInstanceRef.current) {
            setTimeout(() => {
              try {
                const rowIndex = gridInstanceRef.current.getRowIndexByKey(editingRowKeyRef.current);
                if (rowIndex >= 0) {
                  const visibleRows = gridInstanceRef.current.getVisibleRows();
                  const currentRow = visibleRows.find((r: any) => r.key === editingRowKeyRef.current);
                  if (currentRow && !currentRow.isEditing) {
                    // Edit modundan çıkmışsa tekrar edit moduna al
                    gridInstanceRef.current.editRow(rowIndex);
                  }
                }
              } catch (error) {
                console.error('Error restoring edit mode:', error);
              }
            }, 100);
          }
        }}
      />
    </div>
  );
}

