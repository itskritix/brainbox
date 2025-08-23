import { CircleAlert } from 'lucide-react';

import {
  CreatedByFieldAttributes,
  DatabaseViewFilterAttributes,
} from '@brainbox/core';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { BoardViewColumn } from '@brainbox/ui/components/databases/boards/board-view-column';
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { BoardViewContext } from '@brainbox/ui/contexts/board-view';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { useDatabaseView } from '@brainbox/ui/contexts/database-view';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface BoardViewColumnsCreatedByProps {
  field: CreatedByFieldAttributes;
}

export const BoardViewColumnsCreatedBy = ({
  field,
}: BoardViewColumnsCreatedByProps) => {
  const workspace = useWorkspace();
  const database = useDatabase();
  const view = useDatabaseView();

  const createdByCountQuery = useLiveQuery({
    type: 'record.field.value.count',
    databaseId: database.id,
    filters: view.filters,
    fieldId: field.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (createdByCountQuery.isPending) {
    return null;
  }

  const users = createdByCountQuery.data?.values ?? [];

  return (
    <>
      {users.map((user) => {
        const filter: DatabaseViewFilterAttributes = {
          id: '1',
          type: 'field',
          fieldId: field.id,
          operator: 'is_in',
          value: [user.value],
        };

        return (
          <BoardViewContext.Provider
            key={user.value}
            value={{
              field,
              filter,
              canDrop: () => false,
              drop: () => null,
              header: (
                <BoardViewColumnCreatedByHeader
                  field={field}
                  createdBy={user.value}
                  count={user.count}
                />
              ),
              canDrag: () => false,
              onDragEnd: () => {},
            }}
          >
            <BoardViewColumn />
          </BoardViewContext.Provider>
        );
      })}
    </>
  );
};

interface BoardViewColumnCreatedByHeaderProps {
  field: CreatedByFieldAttributes;
  createdBy: string;
  count: number;
}

const BoardViewColumnCreatedByHeader = ({
  createdBy,
  count,
}: BoardViewColumnCreatedByHeaderProps) => {
  const workspace = useWorkspace();

  const userQuery = useLiveQuery({
    type: 'user.get',
    userId: createdBy,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (userQuery.isPending) {
    return (
      <div className="flex flex-row gap-2 items-center">
        <Spinner className="size-5" />
        <p className="text-muted-foreground">Loading...</p>
        <p className="text-muted-foreground text-sm ml-1">
          {count.toLocaleString()}
        </p>
      </div>
    );
  }

  const user = userQuery.data;
  if (!user) {
    return (
      <div className="flex flex-row gap-2 items-center">
        <CircleAlert className="size-5" />
        <p className="text-muted-foreground">Unknown</p>
        <p className="text-muted-foreground text-sm ml-1">
          {count.toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <Avatar
        id={user.id}
        name={user.name}
        avatar={user.avatar}
        className="size-5"
      />
      <p>{user.name}</p>
      <p className="text-muted-foreground text-sm ml-1">
        {count.toLocaleString()}
      </p>
    </div>
  );
};
