import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  
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