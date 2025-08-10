import bcrypt from 'bcrypt';
import db from '../db.js';

const createAdmin = async () => {
  const email = 'admin@gmail.com';
  const plainPassword = 'admin1234';
  const role = 'admin';
  const name = 'Admin';

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await db.query(
      'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, role, name]
    );

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
};

createAdmin();
