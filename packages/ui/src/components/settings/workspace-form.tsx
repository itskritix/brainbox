import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { Avatar } from '@colanode/ui/components/avatars/avatar';
import { Button } from '@colanode/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@colanode/ui/components/ui/form';
import { Input } from '@colanode/ui/components/ui/input';
import { Spinner } from '@colanode/ui/components/ui/spinner';
import { Textarea } from '@colanode/ui/components/ui/textarea';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useMutation } from '@colanode/ui/hooks/use-mutation';
import { openFileDialog } from '@colanode/ui/lib/files';
import { cn } from '@colanode/ui/lib/utils';

const formSchema = z.object({
  workspaceName: z.string().min(3, 'Name must be at least 3 characters long.'),
  workspaceDescription: z.string(),
  workspaceAvatar: z.string().optional().nullable(),
});

export const WorkspaceForm = () => {
  const workspace = useWorkspace();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation();
  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useMutation();
  const canEditWorkspace = workspace.role === 'owner';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceName: workspace.name,
      workspaceDescription: workspace.description ?? '',
      workspaceAvatar: workspace.avatar ?? null,
    },
  });

  const workspaceName = form.watch('workspaceName');
  const workspaceAvatar = form.watch('workspaceAvatar');

  const handleUploadWorkspaceAvatar = async () => {
    if (isUploadingAvatar) return;
    
    const result = await openFileDialog({
      accept: 'image/jpeg, image/jpg, image/png, image/webp',
    });

    if (result.type === 'success') {
      const file = result.files[0];
      if (!file) return;

      uploadAvatar({
        input: {
          type: 'avatar.upload',
          accountId: workspace.accountId,
          file,
        },
        onSuccess(output) {
          if (output.id) {
            form.setValue('workspaceAvatar', output.id);
          }
        },
        onError(error) {
          toast.error(error.message);
        },
      });
    }
  };

  const saveWorkspace = (values: z.output<typeof formSchema>) => {
    updateWorkspace({
      input: {
        type: 'workspace.update',
        id: workspace.id,
        accountId: workspace.accountId,
        name: values.workspaceName,
        description: values.workspaceDescription,
        avatar: values.workspaceAvatar,
      },
      onSuccess() {
        toast.success('Workspace updated');
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={form.handleSubmit(saveWorkspace)}>
        <div className="flex flex-row gap-1">
          <div className="h-40 w-40 pt-3">
            <div
              className={cn(
                "group relative cursor-pointer",
                !canEditWorkspace && "cursor-not-allowed opacity-60"
              )}
              onClick={canEditWorkspace ? handleUploadWorkspaceAvatar : undefined}
            >
              <Avatar
                id={workspace.id}
                name={workspaceName}
                avatar={workspaceAvatar}
                className="h-32 w-32"
              />
              {canEditWorkspace && (
                <div
                  className={cn(
                    "absolute left-0 top-0 hidden h-32 w-32 items-center justify-center overflow-hidden bg-gray-50 group-hover:inline-flex",
                    isUploadingAvatar ? "inline-flex" : "hidden"
                  )}
                >
                  {isUploadingAvatar ? (
                    <Spinner className="size-5" />
                  ) : (
                    <Upload className="size-5 text-foreground" />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-grow space-y-4 py-2 pb-4">
            <FormField
              control={form.control}
              name="workspaceName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} disabled={!canEditWorkspace} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workspaceDescription"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description"
                      {...field} 
                      disabled={!canEditWorkspace}
                      rows={2}
                      className="resize-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            type="submit"
            disabled={isUpdatingWorkspace || !canEditWorkspace || isUploadingAvatar}
            className="w-20"
          >
            {isUpdatingWorkspace && <Spinner className="mr-1" />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};