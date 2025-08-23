import { mapEmoji } from '@brainbox/client/lib/mappers';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { EmojiSearchQueryInput } from '@brainbox/client/queries/emojis/emoji-search';
import { AppService } from '@brainbox/client/services/app-service';
import { Emoji } from '@brainbox/client/types/emojis';
import { Event } from '@brainbox/client/types/events';

export class EmojiSearchQueryHandler
  implements QueryHandler<EmojiSearchQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(input: EmojiSearchQueryInput): Promise<Emoji[]> {
    if (!this.app.assets.emojis) {
      return [];
    }

    const data = await this.app.assets.emojis
      .selectFrom('emojis')
      .innerJoin('emoji_search', 'emojis.id', 'emoji_search.id')
      .selectAll('emojis')
      .where('emoji_search.text', 'match', `${input.query}*`)
      .limit(input.count)
      .execute();

    const emojis: Emoji[] = data.map(mapEmoji);
    return emojis;
  }

  public async checkForChanges(
    _: Event,
    __: EmojiSearchQueryInput,
    ___: Emoji[]
  ): Promise<ChangeCheckResult<EmojiSearchQueryInput>> {
    return {
      hasChanges: false,
    };
  }
}
