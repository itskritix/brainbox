import { toast } from 'sonner';

import { generateId, IdType } from '@brainbox/core';
import { DatabaseForm } from '@brainbox/ui/components/databases/database-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@brainbox/ui/components/ui/dialog';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface DatabaseCreateDialogProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DatabaseCreateDialog = ({
  spaceId,
  open,
  onOpenChange,
}: DatabaseCreateDialogProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const { mutate, isPending } = useMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create database</DialogTitle>
          <DialogDescription>
            Create a new database to store your data
          </DialogDescription>
        </DialogHeader>
        <DatabaseForm
          id={generateId(IdType.Database)}
          values={{
            name: '',
          }}
          isPending={isPending}
          submitText="Create"
          handleCancel={() => {
            onOpenChange(false);
          }}
          handleSubmit={(values) => {
            if (isPending) {
              return;
            }

            mutate({
              input: {
                type: 'database.create',
                parentId: spaceId,
                name: values.name,
                avatar: values.avatar,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              },
              onSuccess(output) {
                onOpenChange(false);
                layout.openLeft(output.id);
              },
              onError(error) {
                toast.error(error.message);
              },
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
