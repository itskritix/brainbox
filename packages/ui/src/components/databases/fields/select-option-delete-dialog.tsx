import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@brainbox/ui/components/ui/alert-dialog';
import { Button } from '@brainbox/ui/components/ui/button';
import { useDatabase } from '@brainbox/ui/contexts/database';

interface SelectOptionDeleteDialogProps {
  fieldId: string;
  optionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SelectOptionDeleteDialog = ({
  fieldId,
  optionId,
  open,
  onOpenChange,
}: SelectOptionDeleteDialogProps) => {
  const database = useDatabase();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want delete this select option?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This option will no longer be
            accessible and all data in the option will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => {
              database.deleteSelectOption(fieldId, optionId);
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
