import { LocalMessageNode } from '@brainbox/client/types';
import { ContainerBreadcrumb } from '@brainbox/ui/components/layouts/containers/container-breadrumb';
import { Message } from '@brainbox/ui/components/messages/message';
import { MessageNotFound } from '@brainbox/ui/components/messages/message-not-found';
import {
  Container,
  ContainerBody,
  ContainerHeader,
} from '@brainbox/ui/components/ui/container';
import { ConversationContext } from '@brainbox/ui/contexts/conversation';
import { useNodeContainer } from '@brainbox/ui/hooks/use-node-container';
import { useNodeRadar } from '@brainbox/ui/hooks/use-node-radar';

interface MessageContainerProps {
  messageId: string;
}

export const MessageContainer = ({ messageId }: MessageContainerProps) => {
  const data = useNodeContainer<LocalMessageNode>(messageId);

  useNodeRadar(data.node);

  if (data.isPending) {
    return null;
  }

  if (!data.node) {
    return <MessageNotFound />;
  }

  return (
    <Container>
      <ContainerHeader>
        <ContainerBreadcrumb breadcrumb={data.breadcrumb} />
      </ContainerHeader>
      <ContainerBody>
        <ConversationContext.Provider
          value={{
            id: data.node.id,
            role: data.role,
            rootId: data.node.rootId,
            canCreateMessage: true,
            onReply: () => {},
            onLastMessageIdChange: () => {},
            canDeleteMessage: () => false,
          }}
        >
          <Message message={data.node} />
        </ConversationContext.Provider>
      </ContainerBody>
    </Container>
  );
};
