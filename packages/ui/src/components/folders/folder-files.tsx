import { useState } from 'react';
import { match } from 'ts-pattern';

import { FileListQueryInput } from '@brainbox/client/queries';
import { FolderLayoutType } from '@brainbox/client/types';
import { GalleryLayout } from '@brainbox/ui/components/folders/galleries/gallery-layout';
import { GridLayout } from '@brainbox/ui/components/folders/grids/grid-layout';
import { ListLayout } from '@brainbox/ui/components/folders/lists/list-layout';
import { FolderContext } from '@brainbox/ui/contexts/folder';
import { useLayout } from '@brainbox/ui/contexts/layout';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQueries } from '@brainbox/ui/hooks/use-live-queries';

const FILES_PER_PAGE = 100;

interface FolderFilesProps {
  id: string;
  name: string;
  layout: FolderLayoutType;
}

export const FolderFiles = ({
  id,
  name,
  layout: folderLayout,
}: FolderFilesProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();

  const [lastPage] = useState<number>(1);
  const inputs: FileListQueryInput[] = Array.from({
    length: lastPage,
  }).map((_, i) => ({
    type: 'file.list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    parentId: id,
    count: FILES_PER_PAGE,
    page: i + 1,
  }));

  const result = useLiveQueries(inputs);
  const files = result.flatMap((data) => data.data ?? []);

  return (
    <FolderContext.Provider
      value={{
        id,
        name,
        files,
        onClick: () => {
          console.log('onClick');
        },
        onDoubleClick: (_, id) => {
          layout.previewLeft(id, true);
        },
        onMove: () => {},
      }}
    >
      {match(folderLayout)
        .with('grid', () => <GridLayout />)
        .with('list', () => <ListLayout />)
        .with('gallery', () => <GalleryLayout />)
        .exhaustive()}
    </FolderContext.Provider>
  );
};
