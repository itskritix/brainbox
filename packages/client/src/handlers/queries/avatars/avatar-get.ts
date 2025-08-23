import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { AvatarGetQueryInput } from '@brainbox/client/queries/avatars/avatar-get';
import { AppService } from '@brainbox/client/services/app-service';
import { Avatar } from '@brainbox/client/types/avatars';
import { Event } from '@brainbox/client/types/events';

export class AvatarGetQueryHandler
  implements QueryHandler<AvatarGetQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(input: AvatarGetQueryInput): Promise<Avatar | null> {
    const account = this.app.getAccount(input.accountId);
    if (!account) {
      return null;
    }

    return account.avatars.getAvatar(input.avatarId, true);
  }

  public async checkForChanges(
    event: Event,
    input: AvatarGetQueryInput
  ): Promise<ChangeCheckResult<AvatarGetQueryInput>> {
    if (
      event.type === 'avatar.created' &&
      event.accountId === input.accountId &&
      event.avatar.id === input.avatarId
    ) {
      return {
        hasChanges: true,
        result: event.avatar,
      };
    }

    if (
      event.type === 'avatar.deleted' &&
      event.accountId === input.accountId &&
      event.avatar.id === input.avatarId
    ) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    return {
      hasChanges: false,
    };
  }
}
