import { mapIcon } from '@brainbox/client/lib';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { IconSearchQueryInput } from '@brainbox/client/queries/icons/icon-search';
import { AppService } from '@brainbox/client/services/app-service';
import { Event } from '@brainbox/client/types/events';
import { Icon } from '@brainbox/client/types/icons';

export class IconSearchQueryHandler
  implements QueryHandler<IconSearchQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(input: IconSearchQueryInput): Promise<Icon[]> {
    if (!this.app.assets.icons) {
      return [];
    }

    const data = await this.app.assets.icons
      .selectFrom('icons')
      .innerJoin('icon_search', 'icons.id', 'icon_search.id')
      .selectAll('icons')
      .where('icon_search.text', 'match', `${input.query}*`)
      .limit(input.count)
      .execute();

    const icons: Icon[] = data.map(mapIcon);
    return icons;
  }

  public async checkForChanges(
    _: Event,
    __: IconSearchQueryInput,
    ___: Icon[]
  ): Promise<ChangeCheckResult<IconSearchQueryInput>> {
    return {
      hasChanges: false,
    };
  }
}
