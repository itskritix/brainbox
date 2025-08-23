import { AppMeta, AppService } from '@brainbox/client/services';
import { AppBadge } from '@brainbox/desktop/main/app-badge';
import { DesktopFileSystem } from '@brainbox/desktop/main/file-system';
import { DesktopKyselyService } from '@brainbox/desktop/main/kysely-service';
import { DesktopPathService } from '@brainbox/desktop/main/path-service';

const appMeta: AppMeta = {
  type: 'desktop',
  platform: process.platform,
};

export const app = new AppService(
  appMeta,
  new DesktopFileSystem(),
  new DesktopKyselyService(),
  new DesktopPathService()
);

export const appBadge = new AppBadge(app);
