import { JSONContent } from '@tiptap/core';

import { Avatar } from '@brainbox/ui/components/avatars/avatar';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';
import { defaultClasses } from '@brainbox/ui/editor/classes';
import { useLiveQuery } from '@brainbox/ui/hooks/use-live-query';

interface MentionRendererProps {
  node: JSONContent;
  keyPrefix: string | null;
}

export const MentionRenderer = ({ node }: MentionRendererProps) => {
  const workspace = useWorkspace();

  const target = node.attrs?.target;
  const userGetQuery = useLiveQuery({
    type: 'user.get',
    userId: target,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  const name = userGetQuery.data?.name ?? 'Unknown';
  return (
    <span className={defaultClasses.mention}>
      <Avatar
        size="small"
        id={target ?? '?'}
        name={name}
        avatar={userGetQuery.data?.avatar}
      />
      <span role="presentation">{name}</span>
    </span>
  );
};
