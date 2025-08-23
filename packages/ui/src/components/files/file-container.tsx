import { LocalFileNode } from '@brainbox/client/types';
import { FileBody } from '@brainbox/ui/components/files/file-body';
import { FileNotFound } from '@brainbox/ui/components/files/file-not-found';
import { FileSettings } from '@brainbox/ui/components/files/file-settings';
import { ContainerBreadcrumb } from '@brainbox/ui/components/layouts/containers/container-breadrumb';
import {
  Container,
  ContainerBody,
  ContainerHeader,
  ContainerSettings,
} from '@brainbox/ui/components/ui/container';
import { useNodeContainer } from '@brainbox/ui/hooks/use-node-container';
import { useNodeRadar } from '@brainbox/ui/hooks/use-node-radar';

interface FileContainerProps {
  fileId: string;
}

export const FileContainer = ({ fileId }: FileContainerProps) => {
  const data = useNodeContainer<LocalFileNode>(fileId);
  useNodeRadar(data.node);

  if (data.isPending) {
    return null;
  }

  if (!data.node) {
    return <FileNotFound />;
  }

  return (
    <Container>
      <ContainerHeader>
        <ContainerBreadcrumb breadcrumb={data.breadcrumb} />
        <ContainerSettings>
          <FileSettings file={data.node} role={data.role} />
        </ContainerSettings>
      </ContainerHeader>
      <ContainerBody>
        <FileBody file={data.node} />
      </ContainerBody>
    </Container>
  );
};
