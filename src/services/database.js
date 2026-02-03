import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_CmE1ZKAYoJI2@ep-old-recipe-ahmckbly-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default sql;
