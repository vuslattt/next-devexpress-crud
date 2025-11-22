'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, {
  Column,
  Selection,
  FilterRow,
  HeaderFilter,
  SearchPanel,
  Toolbar,
  Item,
  Export,
  Paging,
  Pager,
  Editing,
} from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import { Popup } from 'devextreme-react/popup';
import CustomStore from 'devextreme/data/custom_store';
import ProtectedRoute from '@/components/ProtectedRoute';
import { hasManagementPermission } from '@/lib/permissions';

export default function UsersPage() {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [dataSource, setDataSource] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  const gridRef = useRef<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createDataSource = () => {
    return new CustomStore({
      key: 'id',
      load: async () => {
        const response = await fetch('/api/users');
        const data = await response.json();
        return data;
      },
      insert: async (values) => {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        return await response.json();
      },
      update: async (key, values) => {
        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, ...values }),
        });
        return await response.json();
      },
      remove: async (key) => {
        await fetch(`/api/users?ids=${JSON.stringify([key])}`, {
          method: 'DELETE',
        });
        return key;
      },
    });
  };

  useEffect(() => {
    setCanEdit(hasManagementPermission());
    const store = createDataSource();
    setDataSource(store);
  }, []);

  const handleDelete = () => {
    if (selectedRowKeys.length === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    
    try {
      const response = await fetch(`/api/users?ids=${JSON.stringify(selectedRowKeys)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Kullanıcı silinirken hata oluştu';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // JSON parse hatası, varsayılan mesajı kullan
        }
        setErrorMessage(errorMessage);
        setShowError(true);
        return;
      }
      
      const keysToDelete = [...selectedRowKeys];
      setSelectedRowKeys([]);
      
      // DataGrid'i yenile - dataSource'u yeniden oluştur
      const newStore = createDataSource();
      setDataSource(newStore);
      
      // DataGrid instance'ını güncelle
      setTimeout(() => {
        if (gridRef.current && gridRef.current.instance) {
          gridRef.current.instance.option('dataSource', newStore);
        }
      }, 100);
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage('Kullanıcı silinirken hata oluştu');
      setShowError(true);
    }
  };

  const handleEdit = () => {
    if (selectedRowKeys.length === 1) {
      router.push(`/users/${selectedRowKeys[0]}`);
    }
  };

  const handleNew = () => {
    router.push('/users/new');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectionChanged = (e: any) => {
    setSelectedRowKeys(e.selectedRowKeys);
  };

  if (!dataSource) {
    return (
      <ProtectedRoute>
        <div className="p-4">Yükleniyor...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Kullanıcı Listesi</h1>
        <DataGrid
          ref={gridRef}
          dataSource={dataSource}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          wordWrapEnabled={true}
          onSelectionChanged={handleSelectionChanged}
          selectedRowKeys={selectedRowKeys}
          height="calc(100vh - 250px)"
          onRowRemoved={() => {
            // Satır silindikten sonra grid'i yenile
            setTimeout(() => {
              if (dataSource) {
                // dataSource'u yeniden yükle
                const store = new CustomStore({
                  key: 'id',
                  load: async () => {
                    const response = await fetch('/api/users');
                    const data = await response.json();
                    return data;
                  },
                  insert: async (values) => {
                    const response = await fetch('/api/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(values),
                    });
                    return await response.json();
                  },
                  update: async (key, values) => {
                    const response = await fetch('/api/users', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: key, ...values }),
                    });
                    return await response.json();
                  },
                  remove: async (key) => {
                    await fetch(`/api/users?ids=${JSON.stringify([key])}`, {
                      method: 'DELETE',
                    });
                    return key;
                  },
                });
                setDataSource(store);
                if (gridRef.current && gridRef.current.instance) {
                  gridRef.current.instance.option('dataSource', store);
                }
              }
            }, 100);
          }}
        >
          <Selection mode="multiple" />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} />
          <SearchPanel visible={true} placeholder="Q Arama..." />
          <Toolbar>
            <Item name="addButton">
              <Button
                text="+ Yeni"
                onClick={handleNew}
                stylingMode="contained"
                type="default"
                disabled={!canEdit}
              />
            </Item>
            <Item name="editButton">
              <Button
                text="Düzenle"
                onClick={handleEdit}
                stylingMode="contained"
                type="default"
                disabled={selectedRowKeys.length !== 1 || !canEdit}
              />
            </Item>
            <Item name="deleteButton">
              <Button
                text="Sil"
                onClick={handleDelete}
                stylingMode="contained"
                type="danger"
                disabled={selectedRowKeys.length === 0 || !canEdit}
              />
            </Item>
            <Item name="printButton">
              <Button
                text="Yazdır"
                onClick={handlePrint}
                stylingMode="contained"
                type="default"
              />
            </Item>
            <Item name="searchPanel" />
          </Toolbar>
          <Export enabled={true} />
          <Paging defaultPageSize={20} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[10, 20, 50, 100]}
            showInfo={true}
          />
          <Editing
            mode="row"
            allowAdding={false}
            allowUpdating={false}
            allowDeleting={false}
          />
          <Column
            caption="Ad - Soyad"
            cellRender={(data: any) => {
              return `${data.data.name} ${data.data.surname}`;
            }}
          />
          <Column
            dataField="userNo"
            caption="Kullanıcı No"
          />
          <Column
            dataField="username"
            caption="Kullanıcı Adı"
          />
          <Column
            dataField="role"
            caption="Grup Tanımı"
          />
          <Column
            dataField="department"
            caption="Departman"
          />
          <Column
            dataField="admin"
            caption="Admin"
            dataType="boolean"
          />
          <Column
            dataField="representative"
            caption="Temsilci"
            dataType="boolean"
          />
        </DataGrid>
      </div>

      {/* Silme Onay Modal */}
      <Popup
        visible={showDeleteConfirm}
        onHiding={() => setShowDeleteConfirm(false)}
        showTitle={true}
        title="Kullanıcı Sil"
        width={400}
        height={200}
        showCloseButton={true}
      >
        <div className="p-4">
          <p className="mb-4">Seçili kullanıcı(lar) silinsin mi?</p>
          <div className="flex justify-end gap-2">
            <Button
              text="İptal"
              onClick={() => setShowDeleteConfirm(false)}
              stylingMode="outlined"
              type="default"
            />
            <Button
              text="Sil"
              onClick={confirmDelete}
              stylingMode="contained"
              type="danger"
            />
          </div>
        </div>
      </Popup>

      {/* Hata Modal */}
      <Popup
        visible={showError}
        onHiding={() => setShowError(false)}
        showTitle={true}
        title="Hata"
        width={400}
        height={200}
        showCloseButton={true}
      >
        <div className="p-4">
          <p className="mb-4 text-red-600">{errorMessage}</p>
          <div className="flex justify-end">
            <Button
              text="Tamam"
              onClick={() => setShowError(false)}
              stylingMode="contained"
              type="default"
            />
          </div>
        </div>
      </Popup>
    </ProtectedRoute>
  );
}

