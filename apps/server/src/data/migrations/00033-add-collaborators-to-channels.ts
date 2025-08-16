import { Migration, sql } from 'kysely';

export const addCollaboratorsToChannels: Migration = {
  up: async (db) => {
    // Use a transaction to ensure atomicity
    await db.transaction().execute(async (trx) => {
      // Add collaborators field to existing channels
      // Set the channel creator as admin if we can determine who created it
      await sql`
        UPDATE nodes 
        SET attributes = jsonb_set(
          attributes, 
          '{collaborators}', 
          jsonb_build_object(created_by, 'admin')
        )
        WHERE type = 'channel'
        AND NOT (attributes ? 'collaborators')
        AND created_by IS NOT NULL
      `.execute(trx);

      // For channels without a known creator, set empty collaborators object
      // This ensures the field exists but requires manual setup
      await sql`
        UPDATE nodes 
        SET attributes = jsonb_set(
          attributes, 
          '{collaborators}', 
          '{}'
        )
        WHERE type = 'channel'
        AND NOT (attributes ? 'collaborators')
        AND created_by IS NULL
      `.execute(trx);
    });
  },
  down: async (db) => {
    // Remove collaborators field from channels
    await sql`
      UPDATE nodes 
      SET attributes = attributes - 'collaborators'
      WHERE type = 'channel'
      AND (attributes ? 'collaborators')
    `.execute(db);
  },
};
