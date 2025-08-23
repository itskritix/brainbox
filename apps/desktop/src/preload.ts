// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

import { eventBus } from '@brainbox/client/lib';
import { MutationInput, MutationMap } from '@brainbox/client/mutations';
import { QueryInput, QueryMap } from '@brainbox/client/queries';
import { Event, TempFile } from '@brainbox/client/types';
import { generateId, IdType } from '@brainbox/core';

const windowId = generateId(IdType.Window);

contextBridge.exposeInMainWorld('brainbox', {
  init: () => ipcRenderer.invoke('init'),

  executeMutation: <T extends MutationInput>(
    input: T
  ): Promise<MutationMap[T['type']]['output']> => {
    return ipcRenderer.invoke('execute-mutation', input);
  },

  executeQuery: <T extends QueryInput>(
    input: T
  ): Promise<QueryMap[T['type']]['output']> => {
    return ipcRenderer.invoke('execute-query', input);
  },

  executeQueryAndSubscribe: <T extends QueryInput>(
    key: string,
    input: T
  ): Promise<QueryMap[T['type']]['output']> => {
    return ipcRenderer.invoke(
      'execute-query-and-subscribe',
      key,
      windowId,
      input
    );
  },

  unsubscribeQuery: (key: string): Promise<void> => {
    return ipcRenderer.invoke('unsubscribe-query', key, windowId);
  },

  saveTempFile: async (file: File): Promise<TempFile> => {
    const arrayBuffer = await file.arrayBuffer();
    return ipcRenderer.invoke('save-temp-file', {
      buffer: Buffer.from(arrayBuffer),
      name: file.name,
      type: file.type,
      size: file.size,
    });
  },

  openExternalUrl: async (url: string) => {
    return ipcRenderer.invoke('open-external-url', url);
  },

  showItemInFolder: async (path: string) => {
    return ipcRenderer.invoke('show-item-in-folder', path);
  },

  showFileSaveDialog: async ({ name }: { name: string }) => {
    return ipcRenderer.invoke('show-file-save-dialog', { name });
  },
});

contextBridge.exposeInMainWorld('eventBus', {
  subscribe: (callback: (event: Event) => void) => eventBus.subscribe(callback),
  unsubscribe: (id: string) => eventBus.unsubscribe(id),
  publish: (event: Event) => eventBus.publish(event),
});

ipcRenderer.on('event', (_, event) => {
  eventBus.publish(event);
});
