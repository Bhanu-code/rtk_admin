import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BannerForm from './BannerForm';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image,
  MoreVertical,
  AlertCircle
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

  // Fetch banners using react-query
  const fetchBannersMethod = async (): Promise<BannerResponse> => {
    return await userRequest({
      url: '/banner/banners',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { refetch } = useQuery('get-all-banners', fetchBannersMethod, {
    onSuccess: (response) => {
      if (Array.isArray(response.data)) {
        setBanners(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setBanners([]);
      }
    },
    onError: (error) => {
      console.error('Error fetching banners:', error);
      setBanners([]);
    },
  });

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await userRequest({
          url: `/banner/banners/${id}`,
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Filter banners based on search term
  const filteredBanners = banners.filter(banner => 
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <BannerForm
          banner={editingBanner || undefined}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search banners by title or subtitle..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Image className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Banners</p>
                  <p className="text-2xl font-bold">{banners.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.length > 0 ? (
          filteredBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40 bg-gray-100">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium truncate">{banner.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{banner.subtitle}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">No banners found</h3>
            <p className="text-gray-500 mt-1">Add a new banner to get started</p>
            <Button 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerList;