import { mapEmoji } from '@brainbox/client/lib/mappers';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { EmojiListQueryInput } from '@brainbox/client/queries/emojis/emoji-list';
import { AppService } from '@brainbox/client/services/app-service';
import { Emoji } from '@brainbox/client/types/emojis';
import { Event } from '@brainbox/client/types/events';

export class EmojiListQueryHandler
  implements QueryHandler<EmojiListQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(input: EmojiListQueryInput): Promise<Emoji[]> {
    if (!this.app.assets.emojis) {
      return [];
    }

    const offset = input.page * input.count;
    const data = await this.app.assets.emojis
      .selectFrom('emojis')
      .selectAll()
      .where('category_id', '=', input.category)
      .limit(input.count)
      .offset(offset)
      .execute();

    const emojis: Emoji[] = data.map(mapEmoji);
    return emojis;
  }

  public async checkForChanges(
    _: Event,
    __: EmojiListQueryInput,
    ___: Emoji[]
  ): Promise<ChangeCheckResult<EmojiListQueryInput>> {
    return {
      hasChanges: false,
    };
  }
}
