import { useState } from 'react';
import { Cloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  preview?: string;
  onClear?: () => void;
}

export function ImageUpload({ onUpload, preview, onClear }: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUpload(data.url);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Make sure Cloudinary is configured.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  if (preview) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Banner Image *</label>
        <div className="relative rounded-lg overflow-hidden border">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2 gap-1 h-8"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Banner Image *</label>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="pointer-events-none space-y-2">
          <Cloud className="h-8 w-8 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Drag and drop your image here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
            <p className="text-sm font-medium">Uploading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
