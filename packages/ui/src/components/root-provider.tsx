import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';

import { AppType, Event } from '@brainbox/client/types';
import { build } from '@brainbox/core';
import { App } from '@brainbox/ui/components/app';
import { FontLoader } from '@brainbox/ui/components/font-loader';
import { Toaster } from '@brainbox/ui/components/ui/sonner';
import { TooltipProvider } from '@brainbox/ui/components/ui/tooltip';
import { HTML5Backend } from '@brainbox/ui/lib/dnd-backend';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

interface RootProviderProps {
  type: AppType;
}

export const RootProvider = ({ type }: RootProviderProps) => {
  useEffect(() => {
    console.log(`Brainbox | Version: ${build.version} | SHA: ${build.sha}`);

    const id = window.eventBus.subscribe((event: Event) => {
      if (event.type === 'query.result.updated') {
        const result = event.result;
        const queryId = event.id;

        if (!queryId) {
          return;
        }

        queryClient.setQueryData([queryId], result);
      }
    });

    queryClient.getQueryCache().subscribe(async (event) => {
      if (
        event.type === 'removed' &&
        event.query &&
        event.query.queryKey &&
        event.query.queryKey.length > 0
      ) {
        await window.brainbox.unsubscribeQuery(event.query.queryKey[0]);
      }
    });

    return () => {
      window.eventBus.unsubscribe(id);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <TooltipProvider>
          <FontLoader type={type} />
          <App type={type} />
        </TooltipProvider>
        <Toaster />
      </DndProvider>
    </QueryClientProvider>
  );
};
