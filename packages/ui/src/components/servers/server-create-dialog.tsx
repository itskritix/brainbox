import { useState } from 'react';
import { toast } from 'sonner';

import { Server } from '@brainbox/client/types';
import { Button } from '@brainbox/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@brainbox/ui/components/ui/dialog';
import { Input } from '@brainbox/ui/components/ui/input';
import { Label } from '@brainbox/ui/components/ui/label';
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface ServerCreateDialogProps {
  onCancel: () => void;
  onCreate: (server: Server) => void;
}

export const ServerCreateDialog = ({
  onCancel,
  onCreate,
}: ServerCreateDialogProps) => {
  const [open, setOpen] = useState(true);
  const { mutate, isPending } = useMutation();
  const [url, setUrl] = useState('');

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onCancel();
        setOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a server</DialogTitle>
          <DialogDescription>Add a custom server to login to</DialogDescription>
        </DialogHeader>
        <div className="flex-grow space-y-2 py-2 pb-4">
          <Label>Server URL</Label>
          <Input
            placeholder="https://us.brainbox.com/config"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onCancel()}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              mutate({
                input: {
                  type: 'server.create',
                  url,
                },
                onSuccess(output) {
                  onCreate(output.server);
                  toast.success('Server added successfully');
                },
                onError(error) {
                  toast.error(error.message);
                },
              });
            }}
          >
            {isPending && <Spinner className="mr-1" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
