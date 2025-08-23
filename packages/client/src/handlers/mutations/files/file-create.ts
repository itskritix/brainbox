import { WorkspaceMutationHandlerBase } from '@brainbox/client/handlers/mutations/workspace-mutation-handler-base';
import { MutationHandler } from '@brainbox/client/lib/types';
import {
  FileCreateMutationInput,
  FileCreateMutationOutput,
} from '@brainbox/client/mutations';
import { generateId, IdType } from '@brainbox/core';

export class FileCreateMutationHandler
  extends WorkspaceMutationHandlerBase
  implements MutationHandler<FileCreateMutationInput>
{
  async handleMutation(
    input: FileCreateMutationInput
  ): Promise<FileCreateMutationOutput> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const fileId = generateId(IdType.File);
    await workspace.files.createFile(fileId, input.tempFileId, input.parentId);

    return {
      id: fileId,
    };
  }
}
