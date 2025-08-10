-- Add parent information columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255);

-- Update some existing students with dummy parent information for testing
UPDATE users 
SET 
  parent_name = 'Mr. ' || split_part(name, ' ', 2),
  parent_phone = '91' || (1000000000 + id)::text,
  parent_email = lower(replace(name, ' ', '.')) || '.parent@gmail.com'
WHERE role = 'student' AND parent_phone IS NULL;

-- Create attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
  time_in TIME,
  time_out TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create some sample attendance records for testing
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
ON CONFLICT DO NOTHING;