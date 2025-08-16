import { Migration, sql } from 'kysely';

export const addCollaboratorsToChannels: Migration = {
  up: async (db) => {
    // Use a transaction to ensure atomicity
    await db.transaction().execute(async (trx) => {
      // Add collaborators field to existing channels
      // Set the channel creator as admin if we can determine who created it
      await sql`
        UPDATE nodes 
        SET attributes = json_set(
          attributes, 
          '$.collaborators', 
          json_object(created_by, 'admin')
        )
        WHERE JSON_EXTRACT(attributes, '$.type') = 'channel'
        AND JSON_EXTRACT(attributes, '$.collaborators') IS NULL
        AND created_by IS NOT NULL
      `.execute(trx);

      // For channels without a known creator, set empty collaborators object
      // This ensures the field exists but requires manual setup
      await sql`
        UPDATE nodes 
        SET attributes = json_set(
          attributes, 
          '$.collaborators', 
          json_object()
        )
        WHERE JSON_EXTRACT(attributes, '$.type') = 'channel'
        AND JSON_EXTRACT(attributes, '$.collaborators') IS NULL
        AND created_by IS NULL
      `.execute(trx);
    });
  },
  down: async (db) => {
    // Remove collaborators field from channels
    await sql`
      UPDATE nodes 
      SET attributes = json_remove(attributes, '$.collaborators')
      WHERE JSON_EXTRACT(attributes, '$.type') = 'channel'
      AND JSON_EXTRACT(attributes, '$.collaborators') IS NOT NULL
    `.execute(db);
  },
};
