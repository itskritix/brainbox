import { Migration } from 'kysely';
import { getAvailableServers } from '@brainbox/client/lib/deployment-config';

export const createServersTable: Migration = {
  up: async (db) => {
    await db.schema
      .createTable('servers')
      .addColumn('domain', 'text', (col) => col.notNull().primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('avatar', 'text', (col) => col.notNull())
      .addColumn('attributes', 'text', (col) => col.notNull())
      .addColumn('version', 'text', (col) => col.notNull())
      .addColumn('created_at', 'text', (col) => col.notNull())
      .addColumn('synced_at', 'text')
      .execute();

    // Get servers based on deployment configuration
    const servers = getAvailableServers();

    await db
      .insertInto('servers')
      .values(servers)
      .execute();
  },
  down: async (db) => {
    await db.schema.dropTable('servers').execute();
  },
};
