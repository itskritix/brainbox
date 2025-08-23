import { match } from 'ts-pattern';

import { ContainerTab, SpecialContainerTabPath } from '@brainbox/client/types';
import { getIdType, IdType } from '@brainbox/core';
import { AccountLogout } from '@brainbox/ui/components/accounts/account-logout';
import { AccountSettings } from '@brainbox/ui/components/accounts/account-settings';
import { AllSettings } from '@brainbox/ui/components/settings/all-settings';
import { ChannelContainer } from '@brainbox/ui/components/channels/channel-container';
import { ChatContainer } from '@brainbox/ui/components/chats/chat-container';
import { DatabaseContainer } from '@brainbox/ui/components/databases/database-container';
import { FileContainer } from '@brainbox/ui/components/files/file-container';
import { FolderContainer } from '@brainbox/ui/components/folders/folder-container';
import { MessageContainer } from '@brainbox/ui/components/messages/message-container';
import { PageContainer } from '@brainbox/ui/components/pages/page-container';
import { RecordContainer } from '@brainbox/ui/components/records/record-container';
import { SpaceContainer } from '@brainbox/ui/components/spaces/space-container';
import { TabsContent } from '@brainbox/ui/components/ui/tabs';
import { WorkspaceDownloads } from '@brainbox/ui/components/workspaces/downloads/workspace-downloads';
import { WorkspaceStorage } from '@brainbox/ui/components/workspaces/storage/workspace-storage';
import { WorkspaceUploads } from '@brainbox/ui/components/workspaces/uploads/workspace-uploads';
import { WorkspaceSettings } from '@brainbox/ui/components/workspaces/workspace-settings';
import { WorkspaceUsers } from '@brainbox/ui/components/workspaces/workspace-users';

interface ContainerTabContentProps {
  tab: ContainerTab;
}

const getContainerTabContentBody = (tab: ContainerTab) => {
  if (tab.path === SpecialContainerTabPath.WorkspaceSettings) {
    return <WorkspaceSettings />;
  }

  if (tab.path === SpecialContainerTabPath.WorkspaceUsers) {
    return <WorkspaceUsers />;
  }

  if (tab.path === SpecialContainerTabPath.AccountSettings) {
    return <AccountSettings />;
  }

  if (tab.path === SpecialContainerTabPath.AccountLogout) {
    return <AccountLogout />;
  }

  if (tab.path === SpecialContainerTabPath.WorkspaceStorage) {
    return <WorkspaceStorage />;
  }

  if (tab.path === SpecialContainerTabPath.WorkspaceUploads) {
    return <WorkspaceUploads />;
  }

  if (tab.path === SpecialContainerTabPath.WorkspaceDownloads) {
    return <WorkspaceDownloads />;
  }

  if (tab.path === SpecialContainerTabPath.AllSettings) {
    return <AllSettings />;
  }

  return match(getIdType(tab.path))
    .with(IdType.Space, () => <SpaceContainer spaceId={tab.path} />)
    .with(IdType.Channel, () => <ChannelContainer channelId={tab.path} />)
    .with(IdType.Page, () => <PageContainer pageId={tab.path} />)
    .with(IdType.Database, () => <DatabaseContainer databaseId={tab.path} />)
    .with(IdType.Record, () => <RecordContainer recordId={tab.path} />)
    .with(IdType.Chat, () => <ChatContainer chatId={tab.path} />)
    .with(IdType.Folder, () => <FolderContainer folderId={tab.path} />)
    .with(IdType.File, () => <FileContainer fileId={tab.path} />)
    .with(IdType.Message, () => <MessageContainer messageId={tab.path} />)
    .otherwise(() => null);
};

export const ContainerTabContent = ({ tab }: ContainerTabContentProps) => {
  const content = getContainerTabContentBody(tab);
  if (content === null) {
    return null;
  }

  return (
    <TabsContent
      value={tab.path}
      key={tab.path}
      className="h-full min-h-full w-full min-w-full m-0"
    >
      {content}
    </TabsContent>
  );
};
