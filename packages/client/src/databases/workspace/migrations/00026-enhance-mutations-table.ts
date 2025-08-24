import { Migration } from 'kysely';

export const enhanceMutationsTable: Migration = {
  up: async (db) => {
    // Add missing columns to mutations table for better offline queue management
    await db.schema
      .alterTable('mutations')
      .addColumn('last_attempt', 'text')
      .addColumn('error', 'text')
      .execute();
  },
  down: async (db) => {
    await db.schema
      .alterTable('mutations')
      .dropColumn('last_attempt')
      .dropColumn('error')
      .execute();
  },
};