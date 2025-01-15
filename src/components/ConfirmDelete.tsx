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

interface ConfirmDeleteProps {
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete the selected item.",
  trigger,
  onConfirm,
  onCancel,
}) => {
  const handleCancel = () => {
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || <Button variant="destructive">Delete</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDelete;