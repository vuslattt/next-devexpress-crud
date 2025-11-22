'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Item, GroupItem, Label, RequiredRule } from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';
import { TextBox } from 'devextreme-react/text-box';
import { SelectBox } from 'devextreme-react/select-box';
import { CheckBox } from 'devextreme-react/check-box';
import { TabPanel, Item as TabItem } from 'devextreme-react/tab-panel';
import ProtectedRoute from '@/components/ProtectedRoute';
import { hasManagementPermission } from '@/lib/permissions';

const roles = ['GENEL MÜDÜR', 'MUHASEBE ELEMANI', 'SATIŞ TEMSİLCİSİ', 'DEPO SORUMLUSU'];
const departments = ['Yönetim', 'Satın Alma', 'Üretim', 'Satış', 'Muhasebe'];
const adminOptions = ['Admin', 'User'];

export default function UserFormPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id === 'new' ? null : parseInt(params.id as string);
  const [formData, setFormData] = useState<any>({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    role: '',
    department: '',
    admin: 'User',
    canSeeAllBranches: false,
    salesRepresentative: false,
    seesStockCosts: false,
    restrictedFinanceUser: false,
    systemAuthority: false,
  });
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasManagementPermission());
    if (!hasManagementPermission() && userId === null) {
      router.push('/users');
      return;
    }
  }, [router, userId]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setFormData({
              ...data,
              admin: data.admin ? 'Admin' : 'User',
            });
          }
        });
    }
  }, [userId]);

  const handleSave = async () => {
    if (!canEdit) {
      alert('Bu işlem için Yönetim departmanı yetkisi gereklidir');
      return;
    }
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        admin: formData.admin === 'Admin',
      };

      if (userId) {
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId, ...submitData }),
        });
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
      }
      router.push('/users');
    } catch (error) {
      console.error('Save error:', error);
      alert('Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      alert('Bu işlem için Yönetim departmanı yetkisi gereklidir');
      return;
    }
    if (!userId) return;
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

    try {
      await fetch(`/api/users?ids=${JSON.stringify([userId])}`, {
        method: 'DELETE',
      });
      router.push('/users');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme sırasında bir hata oluştu');
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {userId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
          </h1>
          <div className="flex gap-2">
            <Button
              text="Kaydet"
              type="success"
              stylingMode="contained"
              icon="save"
              onClick={handleSave}
              disabled={loading || !canEdit}
            />
            {userId && (
              <Button
                text="Sil"
                type="danger"
                stylingMode="contained"
                icon="trash"
                onClick={handleDelete}
                disabled={!canEdit}
              />
            )}
            <Button
              text="Liste"
              type="default"
              stylingMode="contained"
              icon="list"
              onClick={() => router.push('/users')}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <TabPanel>
            <TabItem title="Kullanıcı Bilgileri">
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Ad *</label>
                  <TextBox
                    value={formData.name}
                    onValueChange={(value) => setFormData({ ...formData, name: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Soyad *</label>
                  <TextBox
                    value={formData.surname}
                    onValueChange={(value) => setFormData({ ...formData, surname: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Kullanıcı Adı *</label>
                  <TextBox
                    value={formData.username}
                    onValueChange={(value) => setFormData({ ...formData, username: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Rol *</label>
                  <SelectBox
                    dataSource={roles}
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    searchEnabled={true}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Departman *</label>
                  <SelectBox
                    dataSource={departments}
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    searchEnabled={true}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Email Adresi *</label>
                  <TextBox
                    value={formData.email}
                    onValueChange={(value) => setFormData({ ...formData, email: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <CheckBox
                    text="Tüm Şubeleri Görebilir"
                    value={formData.canSeeAllBranches}
                    onValueChange={(value) => setFormData({ ...formData, canSeeAllBranches: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <CheckBox
                    text="Stok Maliyetlerini Görür"
                    value={formData.seesStockCosts}
                    onValueChange={(value) => setFormData({ ...formData, seesStockCosts: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <CheckBox
                    text="Kısıtlı Finans Kullanıcısı"
                    value={formData.restrictedFinanceUser}
                    onValueChange={(value) => setFormData({ ...formData, restrictedFinanceUser: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Şifre</label>
                  <TextBox
                    mode="password"
                    value={formData.password}
                    onValueChange={(value) => setFormData({ ...formData, password: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Admin</label>
                  <SelectBox
                    dataSource={adminOptions}
                    value={formData.admin}
                    onValueChange={(value) => setFormData({ ...formData, admin: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <CheckBox
                    text="Satış Temsilcisi"
                    value={formData.salesRepresentative}
                    onValueChange={(value) => setFormData({ ...formData, salesRepresentative: value })}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <CheckBox
                    text="Sistem Yetkilisi"
                    value={formData.systemAuthority}
                    onValueChange={(value) => setFormData({ ...formData, systemAuthority: value })}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </TabItem>
            <TabItem title="Şirket Şube">
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p>Şirket Şube bilgileri burada gösterilecek</p>
              </div>
            </TabItem>
            <TabItem title="Depo">
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p>Depo bilgileri burada gösterilecek</p>
              </div>
            </TabItem>
            <TabItem title="Departman Yetkileri">
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p>Departman Yetkileri bilgileri burada gösterilecek</p>
              </div>
            </TabItem>
          </TabPanel>
        </div>
      </div>
    </ProtectedRoute>
  );
}

