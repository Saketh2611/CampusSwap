import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
    },
  });
} else {
  // Use SQLite for zero-config local development and testing
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignore if cannot create, fallback to memory
    }
  }
  const storagePath = fs.existsSync(dataDir) ? path.join(dataDir, 'campusswap.sqlite') : ':memory:';

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

export default sequelize;
