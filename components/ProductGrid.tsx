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
        const response = await fetch(`/api/orders/${orderId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        return await response.json();
      },
      update: async (key, values) => {
        const response = await fetch(`/api/orders/${orderId}/products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, ...values }),
        });
        return await response.json();
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
    <div className="p-4" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <h3 className="text-lg font-semibold mb-2">Ürünler</h3>
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
          caption="Resim"
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
        />
        </DataGrid>
      </div>
    </div>
  );
}

