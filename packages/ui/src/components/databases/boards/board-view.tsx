import { Fragment } from 'react';

import { BoardViewColumns } from '@brainbox/ui/components/databases/boards/board-view-columns';
import { BoardViewNoGroup } from '@brainbox/ui/components/databases/boards/board-view-no-group';
import { BoardViewSettings } from '@brainbox/ui/components/databases/boards/board-view-settings';
import { ViewFilterButton } from '@brainbox/ui/components/databases/search/view-filter-button';
import { ViewSearchBar } from '@brainbox/ui/components/databases/search/view-search-bar';
import { ViewSortButton } from '@brainbox/ui/components/databases/search/view-sort-button';
import { ViewFullscreenButton } from '@brainbox/ui/components/databases/view-fullscreen-button';
import { ViewTabs } from '@brainbox/ui/components/databases/view-tabs';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { useDatabaseView } from '@brainbox/ui/contexts/database-view';

export const BoardView = () => {
  const database = useDatabase();
  const view = useDatabaseView();

  const groupByField = database.fields.find(
    (field) => field.id === view.groupBy
  );

  return (
    <Fragment>
      <div className="flex flex-row justify-between border-b">
        <ViewTabs />
        <div className="invisible flex flex-row items-center justify-end group-hover/database:visible">
          <ViewFullscreenButton />
          <BoardViewSettings />
          <ViewSortButton />
          <ViewFilterButton />
        </div>
      </div>
      <ViewSearchBar />
      <div className="mt-2 flex w-full min-w-full max-w-full flex-row gap-2 overflow-auto pr-5">
        {groupByField ? (
          <BoardViewColumns field={groupByField} />
        ) : (
          <BoardViewNoGroup />
        )}
      </div>
    </Fragment>
  );
};
