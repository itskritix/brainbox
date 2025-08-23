import { Fragment } from 'react';

import { UpdatedByFieldAttributes } from '@brainbox/core';
import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { useRecord } from '@brainbox/ui/contexts/record';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface RecordUpdatedByValueProps {
  field: UpdatedByFieldAttributes;
}

export const RecordUpdatedByValue = ({ field }: RecordUpdatedByValueProps) => {
  const workspace = useWorkspace();
  const record = useRecord();

  const { data } = useLiveQuery(
    {
      type: 'user.get',
      accountId: workspace.accountId,
      workspaceId: workspace.id,
      userId: record.updatedBy!,
    },
    {
      enabled: !!record.updatedBy,
    }
  );

  const updatedBy = data
    ? {
        name: data.name,
        avatar: data.avatar,
      }
    : null;

  return (
    <div
      className="flex h-full w-full flex-row items-center gap-1 text-sm p-0"
      data-field={field.id}
    >
      {updatedBy && (
        <Fragment>
          <Avatar
            id={record.updatedBy!}
            name={updatedBy.name}
            avatar={updatedBy.avatar}
            size="small"
          />
          <p>{updatedBy.name}</p>
        </Fragment>
      )}
    </div>
  );
};
