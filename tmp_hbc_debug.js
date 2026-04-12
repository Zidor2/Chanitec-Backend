const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const cfg = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'Chanitec'
    };
    const conn = await mysql.createConnection(cfg);
    const [cols] = await conn.execute('DESC quotes');
    console.log('quotes columns:', cols.map(c => c.Field));
    const [rows] = await conn.execute('SELECT id, remise, hbc, HBC FROM quotes LIMIT 1');
    console.log('sample row keys:', rows.length ? Object.keys(rows[0]) : []);
    console.log('sample row:', rows[0]);
    await conn.end();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
