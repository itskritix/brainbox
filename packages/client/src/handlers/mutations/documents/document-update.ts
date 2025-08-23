import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  DocumentUpdateMutationInput,
  DocumentUpdateMutationOutput,
} from '@brainbox/client/mutations';

export class DocumentUpdateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<DocumentUpdateMutationInput>
{
  async handleMutation(
    input: DocumentUpdateMutationInput
  ): Promise<DocumentUpdateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);
    await workspace.documents.updateDocument(input.documentId, input.update);

    return {
      success: true,
    };
  }
}
