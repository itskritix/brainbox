import { ChangeCheckResult, QueryHandler } from '@brainbox/client/lib/types';
import { IconCategoryListQueryInput } from '@brainbox/client/queries/icons/icon-category-list';
import { AppService } from '@brainbox/client/services/app-service';
import { Event } from '@brainbox/client/types/events';
import { IconCategory } from '@brainbox/client/types/icons';

export class IconCategoryListQueryHandler
  implements QueryHandler<IconCategoryListQueryInput>
{
  private readonly app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  public async handleQuery(
    _: IconCategoryListQueryInput
  ): Promise<IconCategory[]> {
    if (!this.app.assets.icons) {
      return [];
    }

    const data = this.app.assets.icons
      .selectFrom('categories')
      .selectAll()
      .execute();
    return data;
  }

  public async checkForChanges(
    _: Event,
    __: IconCategoryListQueryInput,
    ___: IconCategory[]
  ): Promise<ChangeCheckResult<IconCategoryListQueryInput>> {
    return {
      hasChanges: false,
    };
  }
}
