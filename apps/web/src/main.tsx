import * as Comlink from 'comlink';
import { createRoot } from 'react-dom/client';

import { eventBus } from '@brainbox/client/lib';
import { BrowserNotSupported } from '@brainbox/web/components/browser-not-supported';
import { MobileNotSupported } from '@brainbox/web/components/mobile-not-supported';
import { ColanodeWorkerApi } from '@brainbox/web/lib/types';
import { isMobileDevice, isOpfsSupported } from '@brainbox/web/lib/utils';
import { Root } from '@brainbox/web/root';
import DedicatedWorker from '@brainbox/web/workers/dedicated?worker';

const initializeApp = async () => {
  const isMobile = isMobileDevice();
  if (isMobile) {
    const root = createRoot(document.getElementById('root') as HTMLElement);
    root.render(<MobileNotSupported />);
    return;
  }

  const hasOpfsSupport = await isOpfsSupported();
  if (!hasOpfsSupport) {
    const root = createRoot(document.getElementById('root') as HTMLElement);
    root.render(<BrowserNotSupported />);
    return;
  }

  const worker = new DedicatedWorker();
  const workerApi = Comlink.wrap<ColanodeWorkerApi>(worker);

  window.brainbox = {
    init: async () => {
      await workerApi.init();
    },
    executeMutation: async (input) => {
      return workerApi.executeMutation(input);
    },
    executeQuery: async (input) => {
      return workerApi.executeQuery(input);
    },
    executeQueryAndSubscribe: async (key, input) => {
      return workerApi.executeQueryAndSubscribe(key, input);
    },
    saveTempFile: async (file) => {
      return workerApi.saveTempFile(file);
    },
    unsubscribeQuery: async (queryId) => {
      return workerApi.unsubscribeQuery(queryId);
    },
    openExternalUrl: async (url) => {
      window.open(url, '_blank');
    },
    showItemInFolder: async () => {
      // No-op on web
    },
    showFileSaveDialog: async () => undefined,
  };

  window.eventBus = eventBus;

  workerApi.subscribe(
    Comlink.proxy((event) => {
      eventBus.publish(event);
    })
  );

  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(<Root />);
};

initializeApp().catch(() => {
  const root = createRoot(document.getElementById('root') as HTMLElement);
  root.render(<BrowserNotSupported />);
});
