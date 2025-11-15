import { supabase } from '../server/_core/supabaseClient';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('levels')
      .select('id, name')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      return;
    }

    console.log('Connection successful!');
    console.log('Sample data from levels table:', data);
  } catch (error) {
    console.error('Connection test failed with exception:', error);
  }
}

testConnection();