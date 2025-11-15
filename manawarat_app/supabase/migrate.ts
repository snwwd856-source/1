import { supabaseAdmin } from '../server/_core/supabaseClient';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '001_init_schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    console.log('Running Supabase migration...');
    
    // Execute each statement
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        const { error } = await supabaseAdmin.rpc('execute_sql', { sql: trimmedStatement });
        if (error) {
          console.error('Error executing statement:', error);
          console.error('Statement:', trimmedStatement);
        } else {
          console.log('Executed statement successfully');
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();