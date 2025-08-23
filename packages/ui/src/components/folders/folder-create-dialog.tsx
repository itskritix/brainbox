import { toast } from 'sonner';

import { generateId, IdType } from '@brainbox/core';
import { FolderForm } from '@brainbox/ui/components/folders/folder-form';
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

interface FolderCreateDialogProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FolderCreateDialog = ({
  spaceId,
  open,
  onOpenChange,
}: FolderCreateDialogProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const { mutate, isPending } = useMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your pages
          </DialogDescription>
        </DialogHeader>
        <FolderForm
          id={generateId(IdType.Folder)}
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
                type: 'folder.create',
                parentId: spaceId,
                name: values.name,
                avatar: values.avatar,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
                generateIndex: true,
              },
              onSuccess(output) {
                onOpenChange(false);
                layout.previewLeft(output.id);
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
