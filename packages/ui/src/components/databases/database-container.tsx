import { LocalDatabaseNode } from '@brainbox/client/types';
import { Database } from '@brainbox/ui/components/databases/database';
import { DatabaseNotFound } from '@brainbox/ui/components/databases/database-not-found';
import { DatabaseSettings } from '@brainbox/ui/components/databases/database-settings';
import { DatabaseViews } from '@brainbox/ui/components/databases/database-views';
import { ContainerBreadcrumb } from '@brainbox/ui/components/layouts/containers/container-breadrumb';
import {
  Container,
  ContainerBody,
  ContainerHeader,
  ContainerSettings,
} from '@brainbox/ui/components/ui/container';
import { useNodeContainer } from '@brainbox/ui/hooks/use-node-container';
import { useNodeRadar } from '@brainbox/ui/hooks/use-node-radar';

interface DatabaseContainerProps {
  databaseId: string;
}

export const DatabaseContainer = ({ databaseId }: DatabaseContainerProps) => {
  const data = useNodeContainer<LocalDatabaseNode>(databaseId);

  useNodeRadar(data.node);

  if (data.isPending) {
    return null;
  }

  if (!data.node) {
    return <DatabaseNotFound />;
  }

  const { node: database, role } = data;

  return (
    <Container>
      <ContainerHeader>
        <ContainerBreadcrumb breadcrumb={data.breadcrumb} />
        <ContainerSettings>
          <DatabaseSettings database={database} role={role} />
        </ContainerSettings>
      </ContainerHeader>
      <ContainerBody>
        <Database database={database} role={role}>
          <DatabaseViews />
        </Database>
      </ContainerBody>
    </Container>
  );
};
