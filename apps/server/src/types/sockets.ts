import { ClientContext } from '@brainbox/server/types/api';

export type SocketContext = {
  id: string;
  accountId: string;
  deviceId: string;
  client: ClientContext;
};
