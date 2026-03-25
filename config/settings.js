import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const db = new Pool({
  user:  process.env.DB_USER,
  host:  process.env.DB_HOST,
  database:  process.env.DATABASE,
  password:   process.env.DB_PASSWORD ,
  port: 5432 || process.env.DB_PORT  ,

  
 ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false

});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to database');
  }
});


export default db;