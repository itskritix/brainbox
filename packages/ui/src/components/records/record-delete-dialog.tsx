import { toast } from 'sonner';

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
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface RecordDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
}

export const RecordDeleteDialog = ({
  recordId,
  open,
  onOpenChange,
}: RecordDeleteDialogProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const { mutate, isPending } = useMutation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want delete this record?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This record will no longer be
            accessible by you or others you&apos;ve shared it with.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              mutate({
                input: {
                  type: 'record.delete',
                  recordId: recordId,
                  accountId: workspace.accountId,
                  workspaceId: workspace.id,
                },
                onSuccess() {
                  onOpenChange(false);
                  layout.close(recordId);
                },
                onError(error) {
                  toast.error(error.message);
                },
              });
            }}
          >
            {isPending && <Spinner className="mr-1" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
