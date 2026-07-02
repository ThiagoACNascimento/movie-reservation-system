// test/jest-global-setup.ts
import { resolve } from 'path';
import { config } from 'dotenv';
import { Orchestrator } from './orchestrator';
import { expand } from 'dotenv-expand';

const env = config({ path: resolve(__dirname, '../.env.test') });
expand(env);

export default async function globalSetup() {
  const orchestrator = new Orchestrator();
  await orchestrator.resetPrismaDatabase();
  await orchestrator.destroy();
}
