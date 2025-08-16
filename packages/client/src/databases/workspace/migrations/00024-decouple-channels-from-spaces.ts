import { Migration, sql } from 'kysely';

export const decoupleChannelsFromSpaces: Migration = {
  up: async (db) => {
    // Update channel nodes to have workspaceId as parentId instead of spaceId
    // Since parent_id is a generated column, we need to update the attributes JSON
    await sql`
      UPDATE nodes 
      SET attributes = json_set(
        attributes, 
        '$.parentId', 
        (
          SELECT parent_id 
          FROM nodes spaces 
          WHERE spaces.id = nodes.parent_id 
          AND JSON_EXTRACT(spaces.attributes, '$.type') = 'space'
        )
      )
      WHERE JSON_EXTRACT(nodes.attributes, '$.type') = 'channel'
      AND EXISTS (
        SELECT 1 
        FROM nodes spaces 
        WHERE spaces.id = nodes.parent_id 
        AND JSON_EXTRACT(spaces.attributes, '$.type') = 'space'
      )
    `.execute(db);
  },
  down: async (_db) => {
    // This migration is not reversible in a meaningful way
    // since we can't determine which space each channel originally belonged to
    throw new Error('Migration 00024-decouple-channels-from-spaces is not reversible');
  },
};