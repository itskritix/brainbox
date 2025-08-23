import { LocalRecordNode } from '@brainbox/client/types';
import { ContainerBreadcrumb } from '@brainbox/ui/components/layouts/containers/container-breadrumb';
import { RecordBody } from '@brainbox/ui/components/records/record-body';
import { RecordNotFound } from '@brainbox/ui/components/records/record-not-found';
import { RecordSettings } from '@brainbox/ui/components/records/record-settings';
import {
  Container,
  ContainerBody,
  ContainerHeader,
  ContainerSettings,
} from '@brainbox/ui/components/ui/container';
import { useNodeContainer } from '@brainbox/ui/hooks/use-node-container';
import { useNodeRadar } from '@brainbox/ui/hooks/use-node-radar';

interface RecordContainerProps {
  recordId: string;
}

export const RecordContainer = ({ recordId }: RecordContainerProps) => {
  const data = useNodeContainer<LocalRecordNode>(recordId);

  useNodeRadar(data.node);

  if (data.isPending) {
    return null;
  }

  if (!data.node) {
    return <RecordNotFound />;
  }

  const { node: record, role } = data;

  return (
    <Container>
      <ContainerHeader>
        <ContainerBreadcrumb breadcrumb={data.breadcrumb} />
        <ContainerSettings>
          <RecordSettings record={record} role={role} />
        </ContainerSettings>
      </ContainerHeader>
      <ContainerBody>
        <RecordBody record={record} role={role} />
      </ContainerBody>
    </Container>
  );
};
