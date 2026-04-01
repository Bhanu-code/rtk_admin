import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
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

type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'saving' | 'done' | 'error';

const BannerForm: React.FC<BannerFormProps> = ({ banner, onSuccess }) => {
  const [title, setTitle]               = useState<string>(banner?.title || '');
  const [subtitle, setSubtitle]         = useState<string>(banner?.subtitle || '');
  const [image, setImage]               = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl || null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg]         = useState<string>('');

  const token = useSelector((state: any) => state.user.accessToken);
  const authHeader = { Authorization: `Bearer ${token}` };

  const isLoading = ['presigning', 'uploading', 'saving'].includes(uploadStatus);
  const isEdit    = Boolean(banner?.id);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setUploadStatus('idle');
    setErrorMsg('');
  };

  // Step 1: Get presigned PUT URL from our API
  const getPresignedUrl = async (file: File): Promise<{ presignedUrl: string; objectKey: string }> => {
    const res = await userRequest({
      url: '/banner/presign',
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      data: { filename: file.name, contentType: file.type },
    });
    return res.data; // { presignedUrl, objectKey }
  };

  // Step 2: PUT file bytes directly to S3 using the presigned URL
  const uploadToS3 = async (presignedUrl: string, file: File): Promise<void> => {
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) {
      throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      let objectKey: string | undefined;

      if (image) {
        // Step 1 — get presigned URL
        setUploadStatus('presigning');
        const { presignedUrl, objectKey: key } = await getPresignedUrl(image);
        objectKey = key;

        // Step 2 — upload directly to S3
        setUploadStatus('uploading');
        await uploadToS3(presignedUrl, image);
      }

      // Step 3 — save to DB via our API
      setUploadStatus('saving');

      if (isEdit) {
        // PUT — only send objectKey if a new image was selected
        await userRequest({
          url: `/banner/${banner!.id}`,
          method: 'PUT',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          data: {
            ...(objectKey !== undefined && { objectKey }),
            title,
            subtitle,
          },
        });
      } else {
        // POST — objectKey is required for new banners
        if (!objectKey) {
          setErrorMsg('Please select an image.');
          setUploadStatus('error');
          return;
        }
        await userRequest({
          url: '/banner',
          method: 'POST',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          data: { objectKey, title, subtitle },
        });
      }

      setUploadStatus('done');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      setErrorMsg(error?.response?.data?.error || error?.message || 'Something went wrong.');
      setUploadStatus('error');
    }
  };

  const statusLabel: Record<UploadStatus, string> = {
    idle:       'Save Banner',
    presigning: 'Preparing upload...',
    uploading:  'Uploading image...',
    saving:     'Saving...',
    done:       'Saved!',
    error:      'Try again',
  };

  return (
    <Card className="w-full mb-6 bg-[#0f0f1e] border-[#1e1e3a]">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-100">
          {isEdit ? 'Edit Banner' : 'Create New Banner'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter banner title"
              required
              className="bg-[#1a1a2e] border-[#2a2a4a] text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-slate-300">Subtitle</Label>
            <Input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter banner subtitle"
              required
              className="bg-[#1a1a2e] border-[#2a2a4a] text-slate-100 placeholder:text-slate-500 focus:border-violet-500"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-slate-300">Banner Image {!isEdit && <span className="text-red-400">*</span>}</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full p-6 border border-dashed border-[#2a2a4a] rounded-xl bg-[#1a1a2e] hover:border-violet-500/50 hover:bg-[#1a1a3e] transition-colors cursor-pointer"
                >
                  <input
                    id="image"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                  />
                  <Upload className="h-7 w-7 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">
                    {image ? image.name : 'Click to upload image'}
                  </span>
                  <span className="text-xs text-slate-600 mt-1">PNG, JPG, GIF — max 50MB</span>
                </label>
              </div>

              {imagePreview && (
                <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-[#1e1e3a]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Upload progress indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-violet-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {statusLabel[uploadStatus]}
            </div>
          )}

          {/* Error message */}
          {uploadStatus === 'error' && errorMsg && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <XCircle className="h-4 w-4" />
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess()}
              disabled={isLoading}
              className="border-[#2a2a4a] bg-transparent text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {statusLabel[uploadStatus]}
                </>
              ) : uploadStatus === 'done' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                isEdit ? 'Update Banner' : 'Save Banner'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BannerForm;