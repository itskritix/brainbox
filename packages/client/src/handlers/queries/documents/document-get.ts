import { WorkspaceQueryHandlerBase } from '@brainbox/client/handlers/queries/workspace-query-handler-base';
import { mapDocument } from '@brainbox/client/lib/mappers';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { DocumentGetQueryInput } from '@brainbox/client/queries/documents/document-get';
import { Document } from '@brainbox/client/types/documents';
import { Event } from '@brainbox/client/types/events';

export class DocumentGetQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<DocumentGetQueryInput>
{
  public async handleQuery(
    input: DocumentGetQueryInput
  ): Promise<Document | null> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    const document = await workspace.database
      .selectFrom('documents')
      .selectAll()
      .where('id', '=', input.documentId)
      .executeTakeFirst();

    if (!document) {
      return null;
    }

    return mapDocument(document);
  }

  public async checkForChanges(
    event: Event,
    input: DocumentGetQueryInput,
    _: Document | null
  ): Promise<ChangeCheckResult<DocumentGetQueryInput>> {
    if (
      event.type === 'workspace.deleted' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    if (
      event.type === 'document.updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.document.id === input.documentId
    ) {
      return {
        hasChanges: true,
        result: event.document,
      };
    }

    if (
      event.type === 'node.deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.documentId
    ) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    if (
      event.type === 'node.created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.documentId
    ) {
      const newOutput = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: newOutput,
      };
    }

    return {
      hasChanges: false,
    };
  }
}
