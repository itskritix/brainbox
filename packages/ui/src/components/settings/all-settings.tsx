import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@colanode/ui/components/ui/button';
import { Container } from '@colanode/ui/components/ui/container';
import { Separator } from '@colanode/ui/components/ui/separator';
import { Spinner } from '@colanode/ui/components/ui/spinner';
import { AccountForm } from '@colanode/ui/components/settings/account-form';
import { WorkspaceForm } from '@colanode/ui/components/settings/workspace-form';
import { useAccount } from '@colanode/ui/contexts/account';
import { useMutation } from '@colanode/ui/hooks/use-mutation';


export const AllSettings = () => {
  const account = useAccount();
  const { mutate: logout, isPending: isLoggingOut } = useMutation();

  const handleLogout = () => {
    logout({
      input: {
        type: 'account.logout',
        accountId: account.id,
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  };

  return (
    <Container>
      <div className="h-full overflow-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-8">

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Account</h2>
            <Separator className="mt-3" />
          </div>
          <AccountForm />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Workspace</h2>
            <Separator className="mt-3" />
          </div>
          <WorkspaceForm />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Session</h2>
            <Separator className="mt-3" />
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Log out</h3>
              <p className="text-sm text-muted-foreground">
                End your current session and return to the login screen.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-20 flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Danger Zone</h2>
            <Separator className="mt-3" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Delete workspace</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all its data. This cannot be undone.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button variant="destructive" className="w-20" disabled>
                  Delete
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Delete account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button variant="destructive" className="w-20" disabled>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Container>
  );
};