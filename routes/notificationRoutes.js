const express = require('express');
const router = express.Router();
const CronService = require('../services/cronService');

const cronService = new CronService();

// Manual trigger for testing absentee notifications
router.post('/test-absentee', async (req, res) => {
  try {
    console.log('📧 Manual test of absentee notifications triggered');
    await cronService.runManualNotification();
    res.json({ 
      success: true, 
      message: 'Absentee notification test completed. Check server logs for details.' 
    });
  } catch (error) {
    console.error('Error in manual notification test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error running notification test', 
      error: error.message 
    });
  }
});

// Get cron job status
router.get('/status', (req, res) => {
  const status = cronService.getStatus();
  res.json(status);
});

module.exports = router;