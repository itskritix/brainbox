import { Fragment } from 'react';

import { CalendarViewGrid } from '@brainbox/ui/components/databases/calendars/calendar-view-grid';
import { CalendarViewNoGroup } from '@brainbox/ui/components/databases/calendars/calendar-view-no-group';
import { CalendarViewNoValueCount } from '@brainbox/ui/components/databases/calendars/calendar-view-no-value-count';
import { CalendarViewSettings } from '@brainbox/ui/components/databases/calendars/calendar-view-settings';
import { ViewFilterButton } from '@brainbox/ui/components/databases/search/view-filter-button';
import { ViewSearchBar } from '@brainbox/ui/components/databases/search/view-search-bar';
import { ViewSortButton } from '@brainbox/ui/components/databases/search/view-sort-button';
import { ViewFullscreenButton } from '@brainbox/ui/components/databases/view-fullscreen-button';
import { ViewTabs } from '@brainbox/ui/components/databases/view-tabs';
import { useDatabase } from '@brainbox/ui/contexts/database';
import { useDatabaseView } from '@brainbox/ui/contexts/database-view';

export const CalendarView = () => {
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
          {groupByField && <CalendarViewNoValueCount field={groupByField} />}
          <ViewFullscreenButton />
          <CalendarViewSettings />
          <ViewSortButton />
          <ViewFilterButton />
        </div>
      </div>
      <ViewSearchBar />
      <div className="mt-2 w-full min-w-full max-w-full overflow-auto pr-5">
        {groupByField ? (
          <CalendarViewGrid field={groupByField} />
        ) : (
          <CalendarViewNoGroup />
        )}
      </div>
    </Fragment>
  );
};
