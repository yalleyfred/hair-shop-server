import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
       host: process.env.DB_HOST,
       database: process.env.DB,
       password: process.env.DB_PASSWORD,
       user: process.env.DB_USERNAME,
       port: 5433,
});



async function insertUser() {
  const email = 'f@gmail.com';
  const plainPassword = '12345';
  const hashedPassword: string = await bcrypt.hash(plainPassword, 10);

  try {
    await client.connect();
    const existingUser = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        console.log('User already exists:', existingUser.rows[0]);
        return;
    }
    const res = await client.query(
      'INSERT INTO "user" (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );
    console.log('User inserted:', res.rowCount);
  } catch (err) {
    console.error('Error inserting user:', err);
  } finally {
    await client.end();
  }
}
  
insertUser();