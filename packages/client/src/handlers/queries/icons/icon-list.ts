import { mapIcon } from '@brainbox/client/lib';
import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { IconListQueryInput } from '@brainbox/client/queries/icons/icon-list';
import { AppService } from '@brainbox/client/services/app-service';
import { Event } from '@brainbox/client/types/events';
import { Icon } from '@brainbox/client/types/icons';

export class IconListQueryHandler implements QueryHandler<IconListQueryInput> {
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(input: IconListQueryInput): Promise<Icon[]> {
    if (!this.app.assets.icons) {
      return [];
    }

    const offset = input.page * input.count;
    const data = await this.app.assets.icons
      .selectFrom('icons')
      .selectAll()
      .where('category_id', '=', input.category)
      .limit(input.count)
      .offset(offset)
      .execute();

    const icons: Icon[] = data.map(mapIcon);
    return icons;
  }

  public async checkForChanges(
    _: Event,
    __: IconListQueryInput,
    ___: Icon[]
  ): Promise<ChangeCheckResult<IconListQueryInput>> {
    return {
      hasChanges: false,
    };
  }
}
