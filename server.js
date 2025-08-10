/*
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const attendanceRoutes = require('./routes/attendanceRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ make sure this is correct

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api', authRoutes); // ✅ this line enables /api/login

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

*/

const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const CronService = require('./services/cronService');



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', authRoutes);         // for /api/login
app.use('/api/users', userRoutes);   // for managing teachers/students
app.use('/api/attendance', attendanceRoutes); // for attendance
app.use('/api/notifications', notificationRoutes); // for notification testing

// Initialize and start cron service
const cronService = new CronService();
cronService.startDailyAbsenteeNotifications();

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  //console.log(`📅 Daily absentee notifications scheduled for 12:55 AM`);
  //console.log('Loaded ENV:', process.env.INFOBIP_BASE_URL, process.env.INFOBIP_API_KEY, process.env.INFOBIP_SENDER);
});
