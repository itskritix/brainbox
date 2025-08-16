import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

import { LoginOutput } from '@colanode/core';
import { Button } from '@colanode/ui/components/ui/button';
import { GoogleIcon } from '@colanode/ui/components/ui/icons';
import { Spinner } from '@colanode/ui/components/ui/spinner';
import { useApp } from '@colanode/ui/contexts/app';
import { useMutation } from '@colanode/ui/hooks/use-mutation';
import { useLiveQuery } from '@colanode/ui/hooks/use-live-query';
import { getServerDomain } from '@colanode/ui/lib/server-config';

interface GoogleLoginProps {
  context: 'login' | 'register';
  onSuccess: (output: LoginOutput) => void;
}

const GoogleLoginButton = ({ context, onSuccess }: GoogleLoginProps) => {
  const { mutate, isPending } = useMutation();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      mutate({
        input: {
          type: 'google.login',
          code: response.code,
          server: getServerDomain(),
        },
        onSuccess(output) {
          onSuccess(output);
        },
        onError(error) {
          toast.error(error.message);
        },
      });
    },
    flow: 'auth-code',
  });

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => login()}
      disabled={isPending}
      type="button"
    >
      {isPending ? (
        <Spinner className="mr-1 size-4" />
      ) : (
        <GoogleIcon className="mr-1 size-4" />
      )}
      {context === 'login' ? 'Login' : 'Register'} with Google
    </Button>
  );
};

export const GoogleLogin = ({ context, onSuccess }: GoogleLoginProps) => {
  const app = useApp();
  
  const serverListQuery = useLiveQuery({
    type: 'server.list',
  });

  const server = serverListQuery.data?.[0]; // Get the first (and only) server
  const config = server?.attributes.account?.google;

  if (serverListQuery.isPending) {
    return null;
  }

  if (app.type === 'web' && config && config.enabled && config.clientId) {
    return (
      <GoogleOAuthProvider clientId={config.clientId}>
        <GoogleLoginButton onSuccess={onSuccess} context={context} />
      </GoogleOAuthProvider>
    );
  }

  return null;
};
