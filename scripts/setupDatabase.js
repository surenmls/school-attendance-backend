const db = require('../db');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database for WhatsApp notifications...');
    
    // Add parent information columns to users table
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255)
    `);
    console.log('✅ Added parent columns to users table');

    // Update some existing students with dummy parent information for testing
    await db.query(`
      UPDATE users 
      SET 
        parent_name = 'Mr. ' || split_part(name, ' ', 2),
        parent_phone = '91' || (1000000000 + id)::text,
        parent_email = lower(replace(name, ' ', '.')) || '.parent@gmail.com'
      WHERE role = 'student' AND parent_phone IS NULL
    `);
    console.log('✅ Updated students with dummy parent information');

    // Create attendance table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
        time_in TIME,
        time_out TIME,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created attendance table');

    // Create some sample attendance records for testing
    await db.query(`
      INSERT INTO attendance (user_id, date, status, time_in, time_out) 
      SELECT 
        u.id,
        CURRENT_DATE,
        CASE 
          WHEN random() < 0.1 THEN 'Absent'
          WHEN random() < 0.2 THEN 'Late'
          ELSE 'Present'
        END,
        CASE 
          WHEN random() < 0.1 THEN NULL
          ELSE ('08:' || (10 + floor(random() * 50))::text)::TIME
        END,
        CASE 
          WHEN random() < 0.1 THEN NULL
          ELSE ('15:' || (10 + floor(random() * 50))::text)::TIME
        END
      FROM users u 
      WHERE u.role = 'student'
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Created sample attendance records');

    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase(); 