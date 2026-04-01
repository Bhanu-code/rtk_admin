import React, { useState } from 'react';
import { useQuery } from 'react-query';
// import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BannerForm from './BannerForm';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ImageIcon,
  AlertCircle,
  LayoutTemplate,
} from 'lucide-react';
import { userRequest } from '@/utils/requestMethods';
import { useSelector } from 'react-redux';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl?: string;
}

interface BannerResponse {
  data: Banner[];
}

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);

  const token = useSelector((state: any) => state.user.accessToken);
  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchBannersMethod = async (): Promise<BannerResponse> => {
    return await userRequest({
      url: '/banner',
      method: 'GET',
      headers: authHeader,
    });
  };

  const { refetch } = useQuery('get-all-banners', fetchBannersMethod, {
    onSuccess: (response) => {
      if (Array.isArray(response.data)) {
        setBanners(response.data);
      } else {
        setBanners([]);
      }
    },
    onError: () => setBanners([]),
  });

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await userRequest({
          url: `/banner/${id}`,
          method: 'DELETE',
          headers: authHeader,
        });
        refetch();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const handleCreateNew = (): void => {
    setEditingBanner({});
    setShowForm(true);
  };

  const handleEdit = (banner: Banner): void => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleFormSuccess = (): void => {
    setEditingBanner(null);
    setShowForm(false);
    refetch();
  };

  const filteredBanners = banners.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07070f] p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Banners</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your homepage banners</p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl border border-[#1e1e3a] bg-[#0f0f1e] p-6">
            <BannerForm
              banner={editingBanner || undefined}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}

        {/* Search + Stat row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by title or subtitle..."
              className="pl-10 bg-[#0f0f1e] border-[#1e1e3a] text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stat chip */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#1e1e3a] bg-[#0f0f1e]">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <LayoutTemplate className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Banners</p>
              <p className="text-lg font-bold text-slate-100 leading-none">{banners.length}</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.length > 0 ? (
            filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="group rounded-2xl border border-[#1e1e3a] bg-[#0f0f1e] overflow-hidden hover:border-violet-500/40 transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-44 bg-[#12122a]">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-10 w-10 text-slate-600" />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1e]/80 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-100 truncate">{banner.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{banner.subtitle}</p>

                  <div className="mt-4 pt-4 border-t border-[#1e1e3a] flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#1e1e3a] bg-transparent text-slate-300 hover:bg-white/5 hover:text-slate-100 flex items-center justify-center gap-2"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#1e1e3a] bg-transparent text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 px-3"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[#1e1e3a]">
              <div className="p-4 rounded-full bg-[#12122a] mb-4">
                <AlertCircle className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-slate-300 font-medium">No banners found</h3>
              <p className="text-slate-600 text-sm mt-1">
                {searchTerm ? 'Try a different search term' : 'Add a new banner to get started'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleCreateNew}
                  className="mt-5 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Banner
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerList;