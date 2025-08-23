import { useState, useEffect } from 'react';

import { AppType } from '@brainbox/client/types';
import { Account } from '@brainbox/ui/components/accounts/account';
import { Login } from '@brainbox/ui/components/accounts/login';
import { AppLoader } from '@brainbox/ui/components/app-loader';
import { RadarProvider } from '@brainbox/ui/components/radar-provider';
import { ServerProvider } from '@brainbox/ui/components/servers/server-provider';
import { DelayedComponent } from '@brainbox/ui/components/ui/delayed-component';
import { AppContext } from '@brainbox/ui/contexts/app';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';
import { getServerUrl } from '@brainbox/ui/lib/server-config';

interface AppProps {
  type: AppType;
}

export const App = ({ type }: AppProps) => {
  const [initialized, setInitialized] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const appMetadataListQuery = useLiveQuery({
    type: 'app.metadata.list',
  });

  const accountListQuery = useLiveQuery({
    type: 'account.list',
  });

  const serverListQuery = useLiveQuery({
    type: 'server.list',
  });

  useEffect(() => {
    window.brainbox.init().then(() => {
      setInitialized(true);
    });
  }, []);

  // Auto-create default server if none exists
  useEffect(() => {
    if (initialized && serverListQuery.data && serverListQuery.data.length === 0) {
      window.brainbox.executeMutation({
        type: 'server.create',
        url: getServerUrl(),
      });
    }
  }, [initialized, serverListQuery.data]);

  if (
    !initialized ||
    appMetadataListQuery.isPending ||
    accountListQuery.isPending ||
    serverListQuery.isPending
  ) {
    return (
      <DelayedComponent>
        <AppLoader />
      </DelayedComponent>
    );
  }

  const accountMetadata = appMetadataListQuery.data?.find(
    (metadata) => metadata.key === 'account'
  );

  const account =
    accountListQuery.data?.find(
      (account) => account.id === accountMetadata?.value
    ) || accountListQuery.data?.[0];

  return (
    <AppContext.Provider
      value={{
        type,
        getMetadata: (key) => {
          return appMetadataListQuery.data?.find(
            (metadata) => metadata.key === key
          )?.value;
        },
        setMetadata: (key, value) => {
          window.brainbox.executeMutation({
            type: 'app.metadata.update',
            key,
            value,
          });
        },
        deleteMetadata: (key: string) => {
          window.brainbox.executeMutation({
            type: 'app.metadata.delete',
            key,
          });
        },
        openLogin: () => setOpenLogin(true),
        closeLogin: () => setOpenLogin(false),
        openAccount: (id: string) => {
          setOpenLogin(false);
          window.brainbox.executeMutation({
            type: 'app.metadata.update',
            key: 'account',
            value: id,
          });
        },
      }}
    >
      <RadarProvider>
        {!openLogin && account ? (
          <ServerProvider domain={account.server}>
            <Account key={account.id} account={account} />
          </ServerProvider>
        ) : (
          <Login />
        )}
      </RadarProvider>
    </AppContext.Provider>
  );
};
