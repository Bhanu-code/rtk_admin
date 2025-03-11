import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from 'lucide-react';
import { userRequest } from '@/utils/requestMethods';
import { useSelector } from 'react-redux';

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    imageUrl?: string;
}

interface BannerFormProps {
    banner?: Partial<Banner>;
    onSuccess: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, onSuccess }) => {
    const [title, setTitle] = useState<string>(banner?.title || '');
    const [subtitle, setSubtitle] = useState<string>(banner?.subtitle || '');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl || null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const token = useSelector((state: any) => state.user.accessToken);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        if (image) {
            formData.append('image', image);
        }

        try {
            if (banner?.id) {
                await userRequest({
                    url: `/banner/banners/${banner.id}`,
                    method: "PUT",
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`, // Make sure to get the token
                    },
                });
            } else {
                await userRequest({
                    url: "/banner/banners",
                    method: "POST",
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`, // Make sure to get the token
                    },
                });
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving banner:', error);
        }
    }

        return (
            <Card className="w-full mb-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {banner?.id ? 'Edit Banner' : 'Create New Banner'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter banner title"
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input
                                id="subtitle"
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Enter banner subtitle"
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Banner Image</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <input
                                            id="image"
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <label htmlFor="image" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Click to upload image</span>
                                            <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                                        </label>
                                    </div>
                                </div>

                                {imagePreview && (
                                    <div className="w-32 h-32 relative overflow-hidden rounded-lg border border-gray-200">
                                        <img
                                            src={imagePreview}
                                            alt="Banner preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onSuccess()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Banner'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    };

    export default BannerForm;