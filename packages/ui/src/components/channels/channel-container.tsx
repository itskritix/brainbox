import { LocalChannelNode } from '@brainbox/client/types';
import { ChannelNotFound } from '@brainbox/ui/components/channels/channel-not-found';
import { ChannelSettings } from '@brainbox/ui/components/channels/channel-settings';
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

interface ChannelContainerProps {
  channelId: string;
}

export const ChannelContainer = ({ channelId }: ChannelContainerProps) => {
  const data = useNodeContainer<LocalChannelNode>(channelId);

  useNodeRadar(data.node);

  if (data.isPending) {
    return null;
  }

  if (!data.node) {
    return <ChannelNotFound />;
  }

  const { node: channel, role } = data;

  return (
    <Container>
      <ContainerHeader>
        <ContainerBreadcrumb breadcrumb={data.breadcrumb} />
        <ContainerSettings>
          <ChannelSettings channel={channel} role={role} />
        </ContainerSettings>
      </ContainerHeader>
      <ContainerBody>
        <Conversation
          conversationId={channel.id}
          rootId={channel.rootId}
          role={role}
        />
      </ContainerBody>
    </Container>
  );
};
