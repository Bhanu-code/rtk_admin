import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteProps {
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  itemName?: string;           // Optional: Show product name for better UX
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  title = "Delete Product?",
  description = "This action cannot be undone. This will permanently delete the product and all associated images, videos, and files from storage.",
  trigger,
  onConfirm,
  onCancel,
  isLoading = false,
  itemName,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Product
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[460px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
              {itemName && (
                <p className="text-sm text-gray-500 mt-1">
                  Product: <span className="font-medium text-gray-700">{itemName}</span>
                </p>
              )}
            </div>
          </div>
          
          <AlertDialogDescription className="mt-4 text-base leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Yes, Delete Product
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDelete;