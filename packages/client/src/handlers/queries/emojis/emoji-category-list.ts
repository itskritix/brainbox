import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { EmojiCategoryListQueryInput } from '@brainbox/client/queries/emojis/emoji-category-list';
import { AppService } from '@brainbox/client/services/app-service';
import { EmojiCategory } from '@brainbox/client/types/emojis';
import { Event } from '@brainbox/client/types/events';

export class EmojiCategoryListQueryHandler
  implements QueryHandler<EmojiCategoryListQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(
    _: EmojiCategoryListQueryInput
  ): Promise<EmojiCategory[]> {
    if (!this.app.assets.emojis) {
      return [];
    }

    const data = this.app.assets.emojis
      .selectFrom('categories')
      .selectAll()
      .execute();

    return data;
  }

  public async checkForChanges(
    _: Event,
    __: EmojiCategoryListQueryInput,
    ___: EmojiCategory[]
  ): Promise<ChangeCheckResult<EmojiCategoryListQueryInput>> {
    return {
      hasChanges: false,
    };
  }
}
