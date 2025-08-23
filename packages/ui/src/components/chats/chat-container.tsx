import { LocalChatNode } from '@brainbox/client/types';
import { ChatNotFound } from '@brainbox/ui/components/chats/chat-not-found';
import { NodeCollaboratorsPopover } from '@brainbox/ui/components/collaborators/node-collaborators-popover';
import { ContainerBreadcrumb } from '@brainbox/ui/components/layouts/containers/container-breadrumb';
import { Conversation } from '@brainbox/ui/components/messages/conversation';
import {
  Container,
  ContainerBody,
  ContainerHeader,
  ContainerSettings,
} from '@brainbox/ui/components/ui/container';
import { useNodeContainer } from '@brainbox/ui/hooks/use-node-container';
import { useNodeRadar } from '@brainbox/ui/hooks/use-node-radar';

interface ChatContainerProps {
  chatId: string;
}

export const ChatContainer = ({ chatId }: ChatContainerProps) => {
  const data = useNodeContainer<LocalChatNode>(chatId);

  useNodeRadar(data.node);

  if (data.isPending) {
    return null;
  }

  if (!data.node) {
    return <ChatNotFound />;
  }

  const { node, role } = data;

  return (
    <Container>
      <ContainerHeader>
        <ContainerBreadcrumb breadcrumb={data.breadcrumb} />
        <ContainerSettings>
          <NodeCollaboratorsPopover node={node} nodes={[node]} role={role} />
        </ContainerSettings>
      </ContainerHeader>
      <ContainerBody>
        <Conversation
          conversationId={node.id}
          rootId={node.rootId}
          role={role}
        />
      </ContainerBody>
    </Container>
  );
};
