'use client';

import { useState, useEffect, useRef } from 'react';
import DataGrid, {
  Column,
  Selection,
  FilterRow,
  HeaderFilter,
  Toolbar,
  Item,
  Export,
  Paging,
  Pager,
  Editing,
  MasterDetail,
} from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react/button';
import { DateBox } from 'devextreme-react/date-box';
import { SelectBox } from 'devextreme-react/select-box';
import CustomStore from 'devextreme/data/custom_store';
import Cookies from 'js-cookie';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductGrid from '@/components/ProductGrid';
import ProductImageModal from '@/components/ProductImageModal';
import { hasManagementPermission } from '@/lib/permissions';

const branches = ['Merkez', 'Şube 1', 'Şube 2', 'Şube 3'];
const paymentMethods = ['AÇIK HESAP', 'PEŞIN', 'ÇEK', 'NAKİT', 'KREDİ KARTI'];
const deliveryMethods = ['Depo Teslim', 'Adrese Teslim', 'Kargo', 'Müşteri Alacak'];
const companies = [
  { name: 'ODAK İNOVASYON', no: '210027881' },
  { name: 'ALUCOREX', no: '210027886' },
  { name: 'ABC ŞİRKET', no: '210027890' },
  { name: 'XYZ LTD', no: '210027895' },
];

export default function OrdersPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [dataSource, setDataSource] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date>(new Date('2024-10-11'));
  const [endDate, setEndDate] = useState<Date>(new Date('2024-10-21'));
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    setCanEdit(hasManagementPermission());
    
    // Kullanıcıları yükle
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers([{ id: null, name: 'Tümü', surname: '' }, ...data]);
      });

    // DataSource'u oluştur
    const store = new CustomStore({
      key: 'id',
      load: async () => {
        const params = new URLSearchParams({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });
        if (selectedUserId) {
          params.append('userId', selectedUserId.toString());
        }
        const response = await fetch(`/api/orders?${params}`);
        return await response.json();
      },
      insert: async (values) => {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        return await response.json();
      },
      update: async (key, values) => {
        const response = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, ...values }),
        });
        return await response.json();
      },
      remove: async (key) => {
        await fetch(`/api/orders?ids=${JSON.stringify([key])}`, {
          method: 'DELETE',
        });
      },
    });
    setDataSource(store);
  }, [startDate, endDate, selectedUserId]);

  const handleSelectionChanged = (e: any) => {
    setSelectedRowKeys(e.selectedRowKeys);
  };

  const handleImageClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderProductGrid = (data: any) => {
    return <ProductGrid orderId={data.data.id} onImageClick={handleImageClick} />;
  };

  const handleDateChange = (type: 'start' | 'end', date: Date) => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
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
        {/* Toolbar */}
        <div className="bg-black text-white p-2 mb-2 rounded flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <DateBox
              value={startDate}
              onValueChange={(date) => handleDateChange('start', date as Date)}
              displayFormat="dd.MM.yyyy"
              width={100}
              height={28}
            />
            <span>-</span>
            <DateBox
              value={endDate}
              onValueChange={(date) => handleDateChange('end', date as Date)}
              displayFormat="dd.MM.yyyy"
              width={100}
              height={28}
            />
          </div>
          <SelectBox
            dataSource={users}
            displayExpr={(item) => item ? `${item.name} ${item.surname}`.trim() : 'Tümü'}
            valueExpr="id"
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            placeholder="Kullanıcı Seç..."
            width={150}
            height={28}
          />
          <Button
            text="Bugün"
            onClick={() => {
              const today = new Date();
              setStartDate(today);
              setEndDate(today);
            }}
            stylingMode="contained"
            height={28}
          />
          <div className="flex-1"></div>
          <div className="flex items-center gap-1.5">
            <Button
              text="Yeni"
              icon="plus"
              onClick={() => {
                if (canEdit && gridRef.current) {
                  const gridElement = gridRef.current as any;
                  if (gridElement && gridElement.instance) {
                    gridElement.instance.addRow();
                  }
                }
              }}
              stylingMode="contained"
              type="default"
              disabled={!canEdit}
              height={28}
            />
            <Button
              text="Düzenle"
              icon="edit"
              stylingMode="contained"
              type="default"
              disabled={selectedRowKeys.length !== 1 || !canEdit}
              height={28}
            />
            <Button
              text="Yazdır"
              icon="print"
              onClick={handlePrint}
              stylingMode="contained"
              type="default"
              height={28}
            />
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <DataGrid
            ref={gridRef}
            dataSource={dataSource}
            showBorders={true}
            columnAutoWidth={true}
            allowColumnResizing={true}
            wordWrapEnabled={true}
            onSelectionChanged={handleSelectionChanged}
            selectedRowKeys={selectedRowKeys}
            height="calc(100vh - 120px)"
            width="100%"
            onInitialized={(e: any) => {
              if (gridRef.current) {
                (gridRef.current as any).instance = e.component;
              }
            }}
            onInitNewRow={(e: any) => {
              e.data.orderDate = new Date().toISOString().split('T')[0];
            }}
          >
          <Selection mode="single" />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} />
          <Toolbar>
            <Item name="addButton" />
            <Item name="editButton" />
            <Item name="deleteButton" />
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
            allowAdding={canEdit}
            allowUpdating={canEdit}
            allowDeleting={canEdit}
          />
          <MasterDetail
            enabled={true}
            render={renderProductGrid}
          />
          <Column 
            dataField="branch" 
            caption="Şube"
            editCellRender={(data: any) => {
              return (
                <SelectBox
                  dataSource={branches}
                  value={data.value}
                  onValueChange={(value) => data.setValue(value)}
                />
              );
            }}
          />
          <Column dataField="year" caption="Yıl" />
          <Column dataField="orderSeries" caption="Sipariş Seri" />
          <Column dataField="orderNo" caption="Sipariş No" />
          <Column
            dataField="orderDate"
            caption="Sipariş Tarihi"
            dataType="date"
          />
          <Column dataField="orderType" caption="Sipariş Türü" />
          <Column dataField="companyNo" caption="Firma No" />
          <Column 
            dataField="companyName" 
            caption="Firma Adı"
            editCellRender={(data: any) => {
              return (
                <SelectBox
                  dataSource={companies}
                  displayExpr="name"
                  valueExpr="name"
                  value={data.value}
                  onValueChange={(value) => data.setValue(value)}
                />
              );
            }}
          />
          <Column 
            dataField="paymentMethod" 
            caption="Ödeme Şekli"
            editCellRender={(data: any) => {
              return (
                <SelectBox
                  dataSource={paymentMethods}
                  value={data.value}
                  onValueChange={(value) => data.setValue(value)}
                />
              );
            }}
          />
          <Column dataField="paymentDueDate" caption="Ödeme Vadesi" />
          <Column 
            dataField="deliveryMethod" 
            caption="Teslim Şekli"
            editCellRender={(data: any) => {
              return (
                <SelectBox
                  dataSource={deliveryMethods}
                  value={data.value}
                  onValueChange={(value) => data.setValue(value)}
                />
              );
            }}
          />
          <Column dataField="documentApproval" caption="Belge Onayı" dataType="boolean" />
          <Column 
            dataField="representative" 
            caption="Temsilci"
            editCellRender={(data: any) => {
              const reps = users.filter(u => u.id).map(u => `${u.name} ${u.surname}`.trim());
              return (
                <SelectBox
                  dataSource={reps}
                  value={data.value}
                  onValueChange={(value) => data.setValue(value)}
                />
              );
            }}
          />
          </DataGrid>
        </div>

        <ProductImageModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}

