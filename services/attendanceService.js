const db = require('../db');

class AttendanceService {
  async getAbsentStudentsForDate(date) {
    try {
      // Query to get absent students with their parent information
      const query = `
        SELECT 
          a.user_id,
          a.date,
          a.status,
          u.name,
          u.class_name,
          u.parent_phone,
          u.parent_name
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE a.date = $1 
        AND a.status = 'Absent'
        AND u.role = 'student'
        AND u.parent_phone IS NOT NULL
      `;
      
      const result = await db.query(query, [date]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching absent students:', error);
      // If parent_phone column doesn't exist, return empty array to trigger fallback
      if (error.code === '42703' && error.message.includes('parent_phone')) {
        console.log('Parent phone column not found, using fallback data');
        return [];
      }
      throw error;
    }
  }

  async getTodaysAbsentStudents() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return await this.getAbsentStudentsForDate(today);
  }

  // For testing with dummy data when database is not set up
  generateDummyAbsentStudents() {
    const today = new Date().toISOString().split('T')[0];
    
    return [
      {
        user_id: 1,
        date: today,
        status: 'Absent',
        name: 'G Surendra',
        class_name: '10A',
        parent_phone: '8341876457', // Phone number without country code (will be prefixed with 91)
        parent_name: 'Mr. Smith'
      },
      {
        user_id: 2,
        date: today,
        status: 'Absent',
        name: 'G Smily',
        class_name: '10B',
        parent_phone: '8341876457', // Replace with actual parent phone numbers
        parent_name: 'Mrs. Wilson'
      },{
        user_id: 2,
        date: today,
        status: 'Absent',
        name: 'G Mani',
        class_name: '10B',
        parent_phone: '8341876457', // Replace with actual parent phone numbers
        parent_name: 'Mrs. Wilson'
      }
    ];
  }

  async getAbsentStudentsWithFallback() {
    try {
      // Try to get from database first
      const absentStudents = await this.getTodaysAbsentStudents();
      
      // If no data from database, use dummy data for testing
      if (absentStudents.length === 0) {
        console.log('No absent students found in database, using dummy data for testing');
        return this.generateDummyAbsentStudents();
      }
      
      return absentStudents;
    } catch (error) {
      console.log('Database error, falling back to dummy data:', error.message);
      return this.generateDummyAbsentStudents();
    }
  }
}

module.exports = AttendanceService;