'use client';

import { useState, useEffect } from 'react';
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
import CustomStore from 'devextreme/data/custom_store';
import ProtectedRoute from '@/components/ProtectedRoute';
import { hasManagementPermission } from '@/lib/permissions';

export default function UsersPage() {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [dataSource, setDataSource] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasManagementPermission());
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
      },
    });
    setDataSource(store);
  }, []);

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    
    try {
      await fetch(`/api/users?ids=${JSON.stringify(selectedRowKeys)}`, {
        method: 'DELETE',
      });
      setSelectedRowKeys([]);
      if (dataSource) {
        dataSource.reload();
      }
    } catch (error) {
      console.error('Delete error:', error);
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
          dataSource={dataSource}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          wordWrapEnabled={true}
          onSelectionChanged={handleSelectionChanged}
          selectedRowKeys={selectedRowKeys}
          height="calc(100vh - 250px)"
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
    </ProtectedRoute>
  );
}

