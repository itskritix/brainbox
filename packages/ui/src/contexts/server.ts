import { createContext, useContext } from 'react';

import { FeatureKey } from '@brainbox/client/lib';
import { ServerDetails } from '@brainbox/client/types';

interface ServerContext extends ServerDetails {
  supports(feature: FeatureKey): boolean;
}

export const ServerContext = createContext<ServerContext>({} as ServerContext);

export const useServer = () => useContext(ServerContext);
