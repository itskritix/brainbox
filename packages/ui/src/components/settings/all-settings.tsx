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
import { useAccount } from '@colanode/ui/contexts/account';
import { useWorkspace } from '@colanode/ui/contexts/workspace';
import { useMutation } from '@colanode/ui/hooks/use-mutation';
import { openFileDialog } from '@colanode/ui/lib/files';
import { cn } from '@colanode/ui/lib/utils';

const formSchema = z.object({
  accountName: z.string().min(3, 'Name must be at least 3 characters long.'),
  accountAvatar: z.string().optional().nullable(),
  email: z.string().email('Invalid email address'),
  workspaceName: z.string().min(3, 'Name must be at least 3 characters long.'),
  workspaceDescription: z.string(),
  workspaceAvatar: z.string().optional().nullable(),
});

export const AllSettings = () => {
  const account = useAccount();
  const workspace = useWorkspace();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation();
  const { mutate: updateAccount, isPending: isUpdatingAccount } = useMutation();
  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useMutation();
  const canEditWorkspace = workspace.role === 'owner';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: account.name,
      accountAvatar: account.avatar,
      email: account.email,
      workspaceName: workspace.name,
      workspaceDescription: workspace.description ?? '',
      workspaceAvatar: workspace.avatar ?? null,
    },
  });

  const accountName = form.watch('accountName');
  const accountAvatar = form.watch('accountAvatar');
  const workspaceName = form.watch('workspaceName');
  const workspaceAvatar = form.watch('workspaceAvatar');

  const handleUploadAccountAvatar = async () => {
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
          accountId: account.id,
          file,
        },
        onSuccess(output) {
          if (output.id) {
            form.setValue('accountAvatar', output.id);
          }
        },
        onError(error) {
          toast.error(error.message);
        },
      });
    }
  };

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

  const saveAccount = (values: z.output<typeof formSchema>) => {
    updateAccount({
      input: {
        type: 'account.update',
        id: account.id,
        name: values.accountName,
        avatar: values.accountAvatar,
      },
      onSuccess() {
        toast.success('Account updated');
      },
      onError(error) {
        toast.error(error.message);
      },
    });
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
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account and workspace preferences</p>
        </div>

        <Form {...form}>
          <div className="space-y-8">
            {/* Account */}
            <div>
              <h2 className="text-lg font-medium mb-4">Account</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="group relative cursor-pointer"
                    onClick={handleUploadAccountAvatar}
                  >
                    <Avatar
                      id={account.id}
                      name={accountName}
                      avatar={accountAvatar}
                      className="h-16 w-16"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full hidden items-center justify-center bg-black/20 group-hover:flex",
                        isUploadingAvatar && "flex"
                      )}
                    >
                      {isUploadingAvatar ? (
                        <Spinner className="h-4 w-4 text-white" />
                      ) : (
                        <Upload className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    onClick={form.handleSubmit(saveAccount)}
                    disabled={isUpdatingAccount}
                    size="sm"
                  >
                    {isUpdatingAccount && <Spinner className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Workspace */}
            <div>
              <h2 className="text-lg font-medium mb-4">Workspace</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-4">
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
                      className="h-16 w-16"
                    />
                    {canEditWorkspace && (
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full hidden items-center justify-center bg-black/20 group-hover:flex",
                          isUploadingAvatar && "flex"
                        )}
                      >
                        {isUploadingAvatar ? (
                          <Spinner className="h-4 w-4 text-white" />
                        ) : (
                          <Upload className="h-4 w-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <FormField
                      control={form.control}
                      name="workspaceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEditWorkspace} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workspaceDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Description</FormLabel>
                          <FormControl>
                            <Textarea 
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
                  <Button
                    onClick={form.handleSubmit(saveWorkspace)}
                    disabled={isUpdatingWorkspace || !canEditWorkspace}
                    size="sm"
                  >
                    {isUpdatingWorkspace && <Spinner className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h2 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h2>
              <div className="border border-red-200 rounded-lg p-4 space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium mb-2">Delete Workspace</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete this workspace and all its data. This cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Workspace
                  </Button>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Delete Account</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};