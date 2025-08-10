const cron = require('node-cron');
const WhatsAppService = require('./whatsappService');
const AttendanceService = require('./attendanceService');

class CronService {
  constructor() {
    this.whatsappService = new WhatsAppService();
    this.attendanceService = new AttendanceService();
    this.isRunning = false;
  }

  startDailyAbsenteeNotifications() {
    // Schedule cron job to run every day at 10:00 AM
    // Cron pattern: '0 10 * * *' = minute=45, hour=11, any day of month, any month, any day of week
    const cronPattern = '23 15 * * *';
    
    //console.log('📅 Setting up daily absentee notification cron job for 12:55 AM...');
    
    const task = cron.schedule(cronPattern, async () => {
      await this.processAbsenteeNotifications();
    }, {
      scheduled: false, // Don't start immediately
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });

    // Start the cron job
    task.start();
    this.isRunning = true;
    
    //console.log('✅ Daily absentee notification cron job started successfully!');
      //console.log('⏰ Will run every day at 11:45 AM');
    
    return task;
  }

  async processAbsenteeNotifications() {
    try {
      console.log('🔄 Processing daily absentee notifications...');
      const startTime = new Date();
      
      // Get today's absent students
      const absentStudents = await this.attendanceService.getAbsentStudentsWithFallback();
      
      if (absentStudents.length === 0) {
        console.log('✅ No absent students found for today. No notifications to send.');
        return;
      }

      console.log(`📊 Found ${absentStudents.length} absent students for today:`, 
        absentStudents.map(s => s.name).join(', '));

      // Send WhatsApp notifications
      const results = await this.whatsappService.sendBulkAbsenteeNotifications(absentStudents);
      
      // Log results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      //console.log(`📱 WhatsApp Notification Results:`);
      //console.log(`   ✅ Successfully sent: ${successCount}`);
      //console.log(`   ❌ Failed to send: ${failureCount}`);
      
      if (failureCount > 0) {
        console.log('Failed notifications:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`   - ${r.student} (${r.phone}): ${r.error}`);
        });
      }

      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
     // console.log(`⏱️ Process completed in ${duration} seconds`);
      
    } catch (error) {
      //console.error('❌ Error in processAbsenteeNotifications:', error);
    }
  }

  // Method to manually trigger the notification process (for testing)
  async runManualNotification() {
    // console.log('🧪 Running manual absentee notification test...');
    await this.processAbsenteeNotifications();
  }

  stopCronJob() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.isRunning = false;
      console.log('🛑 Cron job stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning ? 'Daily at 11:45 AM' : 'Not scheduled'
    };
  }
}

module.exports = CronService;