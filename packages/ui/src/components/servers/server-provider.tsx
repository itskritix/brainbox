import { isFeatureSupported } from '@brainbox/client/lib';
import { ServerNotFound } from '@brainbox/ui/components/servers/server-not-found';
import { ServerContext } from '@brainbox/ui/contexts/server';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface ServerProviderProps {
  domain: string;
  children: React.ReactNode;
}

export const ServerProvider = ({ domain, children }: ServerProviderProps) => {
  const serverListQuery = useLiveQuery({
    type: 'server.list',
  });

  const server = serverListQuery.data?.find(
    (server) => server.domain === domain
  );

  if (serverListQuery.isPending) {
    return null;
  }

  if (!server) {
    return <ServerNotFound domain={domain} />;
  }

  return (
    <ServerContext.Provider
      value={{
        ...server,
        supports: (feature) => {
          return isFeatureSupported(feature, server.version);
        },
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};
