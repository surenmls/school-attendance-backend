const express = require('express');
const router = express.Router();
const db = require('../db'); // PostgreSQL pool

// Dummy attendance data for development
const generateDummyAttendance = () => {
  const data = [];
  const classes = ['Grade 1', 'Grade 2', 'Grade 3', '10A', '10B', '11A', '11B', '12A', '12B'];
  const statuses = ['Present', 'Absent', 'Late', 'Excused'];
  const roles = ['student', 'teacher'];
  
  // Generate student names
  const studentNames = [
    'John Smith', 'Emma Wilson', 'Michael Brown', 'Sophia Davis', 'William Miller',
    'Olivia Garcia', 'James Rodriguez', 'Isabella Martinez', 'Benjamin Anderson', 'Mia Taylor',
    'Lucas Thomas', 'Charlotte Jackson', 'Henry White', 'Amelia Harris', 'Alexander Martin',
    'Harper Thompson', 'Sebastian Garcia', 'Evelyn Lee', 'Jack Walker', 'Abigail Hall',
    'Owen Allen', 'Emily Young', 'Theodore King', 'Elizabeth Wright', 'Connor Lopez',
    'Sofia Hill', 'Caleb Green', 'Avery Adams', 'Ryan Baker', 'Ella Nelson',
    'Nathan Carter', 'Scarlett Mitchell', 'Isaac Perez', 'Madison Roberts', 'Aaron Turner',
    'Luna Phillips', 'Jordan Campbell', 'Grace Parker', 'Ian Evans', 'Chloe Edwards',
    'Adrian Collins', 'Zoey Stewart', 'Christian Sanchez', 'Layla Morris', 'Hunter Rogers',
    'Samantha Reed', 'Eli Cook', 'Aubrey Bailey', 'Andrew Cooper', 'Lily Richardson'
  ];

  const teacherNames = [
    'Mrs. Johnson', 'Mr. Thompson', 'Ms. Williams', 'Dr. Brown', 'Prof. Davis',
    'Mrs. Wilson', 'Mr. Anderson', 'Ms. Martinez', 'Dr. Taylor', 'Prof. Moore'
  ];

  let id = 1;
  
  // Generate attendance records for the past 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // Add student records
    studentNames.forEach((name, index) => {
      const className = classes[index % classes.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      data.push({
        id: id++,
        user_id: index + 1,
        name: name,
        class_name: className,
        role: 'student',
        date: dateStr,
        status: status,
        time_in: status === 'Present' || status === 'Late' ? 
          `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
        time_out: status === 'Present' ? 
          `${15 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
        notes: status === 'Excused' ? 'Medical appointment' : 
               status === 'Late' ? 'Traffic delay' : null
      });
    });
    
    // Add teacher records (less frequent)
    if (dayOffset % 3 === 0) {
      teacherNames.forEach((name, index) => {
        const className = classes[index % classes.length];
        const status = Math.random() > 0.1 ? 'Present' : 'Absent'; // Teachers rarely absent
        
        data.push({
          id: id++,
          user_id: studentNames.length + index + 1,
          name: name,
          class_name: className,
          role: 'teacher',
          date: dateStr,
          status: status,
          time_in: status === 'Present' ? 
            `${7 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
          time_out: status === 'Present' ? 
            `${16 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
          notes: status === 'Absent' ? 'Professional development' : null
        });
      });
    }
  }
  
  return data;
};

// GET /api/attendance?role=student&class_name=10A&start=2025-08-01&end=2025-08-05&page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const { role, class_name, start, end, page = 1, limit = 10, status } = req.query; // <-- add status

    // For now, use dummy data instead of database
    let attendanceData = generateDummyAttendance();

    // Apply filters
    if (role) {
      attendanceData = attendanceData.filter(record => record.role === role);
    }

    if (class_name) {
      attendanceData = attendanceData.filter(record => record.class_name === class_name);
    }

    if (status) {
      attendanceData = attendanceData.filter(
        record => record.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (start && end) {
      attendanceData = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    // Sort by date (newest first)
    attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = attendanceData.slice(startIndex, endIndex);
    
    // Calculate pagination info
    const totalRecords = attendanceData.length;
    const totalPages = Math.ceil(totalRecords / limit);
    
    res.json({
      data: paginatedData,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total: totalRecords,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        role,
        class_name,
        start,
        end
      }
    });
    
    // Uncomment below when you want to use the database instead of dummy data
    /*
    let query = `SELECT a.*, u.name, u.class_name 
                 FROM attendance a 
                 JOIN users u ON a.user_id = u.id 
                 WHERE 1=1`;
    let params = [];
    let i = 1;

    if (role) {
      query += ` AND u.role = $${i++}`;
      params.push(role);
    }

    if (class_name) {
      query += ` AND u.class_name = $${i++}`;
      params.push(class_name);
    }

    if (start && end) {
      query += ` AND a.date BETWEEN $${i++} AND $${i++}`;
      params.push(start, end);
    }
    if (status) {
  query += ` AND a.status = $${i++}`;
  params.push(status);
}
    query += ` ORDER BY a.date DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);
    res.json(result.rows);
    */
  } catch (err) {
    console.error('Attendance fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
