const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');
        console.log('Vector extension enabled successfully.');
    } catch (err) {
        console.error('Error enabling vector extension:', err);
    } finally {
        await client.end();
    }
}

run();
