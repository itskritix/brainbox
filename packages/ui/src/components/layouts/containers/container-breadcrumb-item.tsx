import { LocalNode } from '@brainbox/client/types';
import { ChannelBreadcrumbItem } from '@brainbox/ui/components/channels/channel-breadcrumb-item';
import { ChatBreadcrumbItem } from '@brainbox/ui/components/chats/chat-breadcrumb-item';
import { DatabaseBreadcrumbItem } from '@brainbox/ui/components/databases/database-breadcrumb-item';
import { FileBreadcrumbItem } from '@brainbox/ui/components/files/file-breadcrumb-item';
import { FolderBreadcrumbItem } from '@brainbox/ui/components/folders/folder-breadcrumb-item';
import { MessageBreadcrumbItem } from '@brainbox/ui/components/messages/message-breadcrumb-item';
import { PageBreadcrumbItem } from '@brainbox/ui/components/pages/page-breadcrumb-item';
import { RecordBreadcrumbItem } from '@brainbox/ui/components/records/record-breadcrumb-item';
import { SpaceBreadcrumbItem } from '@brainbox/ui/components/spaces/space-breadcrumb-item';

interface ContainerBreadcrumbItemProps {
  node: LocalNode;
}

export const ContainerBreadcrumbItem = ({
  node,
}: ContainerBreadcrumbItemProps) => {
  switch (node.type) {
    case 'space':
      return <SpaceBreadcrumbItem space={node} />;
    case 'channel':
      return <ChannelBreadcrumbItem channel={node} />;
    case 'chat':
      return <ChatBreadcrumbItem chat={node} />;
    case 'page':
      return <PageBreadcrumbItem page={node} />;
    case 'database':
      return <DatabaseBreadcrumbItem database={node} />;
    case 'record':
      return <RecordBreadcrumbItem record={node} />;
    case 'folder':
      return <FolderBreadcrumbItem folder={node} />;
    case 'file':
      return <FileBreadcrumbItem file={node} />;
    case 'message':
      return <MessageBreadcrumbItem message={node} />;
    default:
      return null;
  }
};
