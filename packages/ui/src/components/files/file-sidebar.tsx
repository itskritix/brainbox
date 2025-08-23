import { Fragment } from 'react';

import { LocalFileNode } from '@brainbox/client/types';
import { formatBytes, formatDate } from '@brainbox/core';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { FileThumbnail } from '@brainbox/ui/components/files/file-thumbnail';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface FileSidebarProps {
  file: LocalFileNode;
}

const FileMeta = ({ title, value }: { title: string; value: string }) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-foreground/80">{value}</p>
    </div>
  );
};

export const FileSidebar = ({ file }: FileSidebarProps) => {
  const workspace = useWorkspace();

  const userQuery = useLiveQuery({
    type: 'user.get',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    userId: file.createdBy,
  });

  const user = userQuery.data ?? null;

  return (
    <Fragment>
      <div className="flex items-center gap-x-4 p-2">
        <FileThumbnail
          file={file}
          className="h-12 w-9 min-w-[36px] overflow-hidden rounded object-contain"
        />
        <div
          className="line-clamp-3 break-words text-base font-medium"
          title={file.attributes.name}
        >
          {file.attributes.name}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <FileMeta title="Name" value={file.attributes.name} />
        <FileMeta title="Type" value={file.attributes.mimeType} />
        <FileMeta title="Size" value={formatBytes(file.attributes.size)} />
        <FileMeta title="Created at" value={formatDate(file.createdAt)} />

        {user && (
          <div>
            <p className="text-xs text-muted-foreground">Created by</p>
            <div className="mt-1 flex flex-row items-center gap-2">
              <Avatar
                id={user.id}
                name={user.name}
                avatar={user.avatar}
                className="h-8 w-8"
              />
              <p className="text-foreground/80">{user.name}</p>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};
