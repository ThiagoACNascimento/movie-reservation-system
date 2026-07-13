import { resolve } from 'path';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

const env = config({
  path: resolve(__dirname, '../.env.test'),
  override: true,
});
expand(env);
