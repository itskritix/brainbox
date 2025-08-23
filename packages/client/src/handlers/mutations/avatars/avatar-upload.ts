import { MutationHandler } from '@brainbox/client/lib/types';
import { MutationError, MutationErrorCode } from '@brainbox/client/mutations';
import {
  AvatarUploadMutationInput,
  AvatarUploadMutationOutput,
} from '@brainbox/client/mutations/avatars/avatar-upload';
import { AppService } from '@brainbox/client/services/app-service';

interface AvatarUploadResponse {
  id: string;
}

export class AvatarUploadMutationHandler
  implements MutationHandler<AvatarUploadMutationInput>
{
  private readonly app: AppService;

  constructor(appService: AppService) {
    this.app = appService;
  }

  async handleMutation(
    input: AvatarUploadMutationInput
  ): Promise<AvatarUploadMutationOutput> {
    const account = this.app.getAccount(input.accountId);

    if (!account) {
      throw new MutationError(
        MutationErrorCode.AccountNotFound,
        'Account not found or has been logged out already. Try closing the app and opening it again.'
      );
    }

    try {
      const filePath = input.file.path;
      const fileExists = await this.app.fs.exists(filePath);

      if (!fileExists) {
        throw new MutationError(
          MutationErrorCode.FileNotFound,
          `Avatar file does not exist`
        );
      }

      const fileStream = await this.app.fs.readStream(filePath);
      const response = await account.client
        .post('v1/avatars', {
          body: fileStream,
          headers: {
            'Content-Type': input.file.mimeType,
            'Content-Length': input.file.size.toString(),
          },
        })
        .json<AvatarUploadResponse>();

      await this.app.fs.delete(filePath);
      await account.avatars.downloadAvatar(response.id);

      return {
        id: response.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new MutationError(MutationErrorCode.ApiError, error.message);
      }

      throw new MutationError(
        MutationErrorCode.ApiError,
        'Unknown error occurred'
      );
    } finally {
      try {
        await this.app.fs.delete(input.file.path);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
