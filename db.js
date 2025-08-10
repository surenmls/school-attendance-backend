// backend/db.js
const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'school_attendance',
//   password: 'admin',
//   port: 5432,
// });

// const pool = new Pool({
//   user: 'school_attendance_db_user',
//   host: 'dpg-d2cc918gjchc73806t6g-a',
//   database: 'school_attendance_db',
//   password: 'mn187EImcPDxnCZF4uomkONE97oi7MDo',
//   port: 5432,
// });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } /// required for Render
});
module.exports = pool;
