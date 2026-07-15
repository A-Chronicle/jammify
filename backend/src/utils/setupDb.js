import { pool } from './db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function setupDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    console.log('✅ Database schema created successfully!')
  } catch (error) {
    console.error('❌ Error creating database schema:', error)
  } finally {
    await pool.end()
  }
}

setupDatabase()
