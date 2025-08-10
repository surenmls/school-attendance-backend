// Simple test script to verify WhatsApp notification system
const CronService = require('../services/cronService');
const AttendanceService = require('../services/attendanceService');

async function testNotificationSystem() {
  console.log('🧪 Testing WhatsApp Notification System\n');

  try {
    // Test 1: Check AttendanceService
    console.log('1️⃣ Testing AttendanceService...');
    const attendanceService = new AttendanceService();
    const absentStudents = await attendanceService.getAbsentStudentsWithFallback();
    console.log(`   Found ${absentStudents.length} absent students:`, 
      absentStudents.map(s => s.name).join(', '));

    // Test 2: Check CronService
    console.log('\n2️⃣ Testing CronService...');
    const cronService = new CronService();
    const status = cronService.getStatus();
    console.log('   Cron Status:', status);

    // Test 3: Manual notification test (only if environment is configured)
    if (process.env.INFOBIP_API_KEY && process.env.INFOBIP_SENDER) {
      console.log('\n3️⃣ Testing Manual Notification...');
      await cronService.runManualNotification();
    } else {
      console.log('\n3️⃣ Skipping Manual Notification Test');
      console.log('   ⚠️  Infobip credentials not configured in environment');
      console.log('   ℹ️  Set INFOBIP_API_KEY and INFOBIP_SENDER in .env to enable');
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testNotificationSystem();