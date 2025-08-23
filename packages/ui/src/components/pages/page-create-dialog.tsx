import { toast } from 'sonner';

import { generateId, IdType } from '@brainbox/core';
import { PageForm } from '@brainbox/ui/components/pages/page-form';
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

interface PageCreateDialogProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PageCreateDialog = ({
  spaceId,
  open,
  onOpenChange,
}: PageCreateDialogProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const { mutate, isPending } = useMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create page</DialogTitle>
          <DialogDescription>
            Create a new page to collaborate with your peers
          </DialogDescription>
        </DialogHeader>
        <PageForm
          id={generateId(IdType.Page)}
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
                type: 'page.create',
                parentId: spaceId,
                name: values.name,
                avatar: values.avatar,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
                generateIndex: true,
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
