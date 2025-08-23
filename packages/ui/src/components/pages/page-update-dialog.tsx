import { toast } from 'sonner';

import { LocalPageNode } from '@brainbox/client/types';
import { NodeRole, hasNodeRole } from '@brainbox/core';
import { PageForm } from '@brainbox/ui/components/pages/page-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@brainbox/ui/components/ui/dialog';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

interface PageUpdateDialogProps {
  page: LocalPageNode;
  role: NodeRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PageUpdateDialog = ({
  page,
  role,
  open,
  onOpenChange,
}: PageUpdateDialogProps) => {
  const workspace = useWorkspace();
  const { mutate, isPending } = useMutation();
  const canEdit = hasNodeRole(role, 'editor');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update page</DialogTitle>
          <DialogDescription>Update the page name and icon</DialogDescription>
        </DialogHeader>
        <PageForm
          id={page.id}
          values={{
            name: page.attributes.name,
            avatar: page.attributes.avatar,
          }}
          isPending={isPending}
          submitText="Update"
          readOnly={!canEdit}
          handleCancel={() => {
            onOpenChange(false);
          }}
          handleSubmit={(values) => {
            if (isPending) {
              return;
            }

            mutate({
              input: {
                type: 'page.update',
                pageId: page.id,
                name: values.name,
                avatar: values.avatar,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              },
              onSuccess() {
                onOpenChange(false);
                toast.success('Page was updated successfully');
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
