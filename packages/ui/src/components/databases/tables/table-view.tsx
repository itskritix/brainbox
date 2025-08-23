import { Fragment } from 'react';

import { ViewFilterButton } from '@brainbox/ui/components/databases/search/view-filter-button';
import { ViewSearchBar } from '@brainbox/ui/components/databases/search/view-search-bar';
import { ViewSortButton } from '@brainbox/ui/components/databases/search/view-sort-button';
import { TableViewBody } from '@brainbox/ui/components/databases/tables/table-view-body';
import { TableViewHeader } from '@brainbox/ui/components/databases/tables/table-view-header';
import { TableViewRecordCreateRow } from '@brainbox/ui/components/databases/tables/table-view-record-create-row';
import { TableViewSettings } from '@brainbox/ui/components/databases/tables/table-view-settings';
import { ViewFullscreenButton } from '@brainbox/ui/components/databases/view-fullscreen-button';
import { ViewTabs } from '@brainbox/ui/components/databases/view-tabs';

export const TableView = () => {
  return (
    <Fragment>
      <div className="flex flex-row justify-between border-b">
        <ViewTabs />
        <div className="invisible flex flex-row items-center justify-end group-hover/database:visible">
          <ViewFullscreenButton />
          <TableViewSettings />
          <ViewSortButton />
          <ViewFilterButton />
        </div>
      </div>
      <ViewSearchBar />
      <div className="mt-2 w-full min-w-full max-w-full overflow-auto pr-5">
        <TableViewHeader />
        <TableViewBody />
        <TableViewRecordCreateRow />
      </div>
    </Fragment>
  );
};
