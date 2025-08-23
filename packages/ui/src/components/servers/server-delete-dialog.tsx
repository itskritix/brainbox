import { toast } from 'sonner';

import { ServerDetails } from '@brainbox/client/types';
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
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface ServerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: ServerDetails;
}

export const ServerDeleteDialog = ({
  server,
  open,
  onOpenChange,
}: ServerDeleteDialogProps) => {
  const { mutate, isPending } = useMutation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want delete the server{' '}
            <span className="font-bold">&quot;{server.domain}&quot;</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Deleting the server will remove all accounts connected to it. You
            can re-add it later.
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
                  type: 'server.delete',
                  domain: server.domain,
                },
                onSuccess() {
                  onOpenChange(false);
                  toast.success(
                    'Server and all associated accounts have been deleted'
                  );
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
