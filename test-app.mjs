import fetch from 'node-fetch';

// Test the app renders without errors
async function test() {
  try {
    const response = await fetch('http://localhost:3001');
    const html = await response.text();
    
    // Check if it's a valid HTML response
    if (html.includes('DOCTYPE') && !html.includes('error')) {
      console.log('✓ App renders successfully');
      
      // Check for the schedule tab and tasks
      if (html.includes('Schedule') || html.includes('Mission Control')) {
        console.log('✓ Schedule/Calendar content exists');
      }
      
      // Check for task rendering code
      if (html.includes('getTasksForDay') || html.includes('renderCalendar')) {
        console.log('✓ Task rendering logic is present');
      }
      
      process.exit(0);
    } else {
      console.log('✗ App error detected');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

test();
