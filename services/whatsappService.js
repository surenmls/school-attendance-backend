const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.INFOBIP_URL = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    this.apiKey = process.env.INFOBIP_API_KEY;
    this.sender = process.env.INFOBIP_SENDER; // Your WhatsApp sender number
    this.AUTH_HEADER = `App ${this.apiKey}`;
    
    // Log configuration for debugging
    console.log('WhatsApp Service Configuration:');
    console.log('  Base URL:', this.INFOBIP_URL);
    console.log('  API Key:', this.apiKey ? 'Set' : 'Not set');
    console.log('  Sender:', this.sender || 'Not set');
  }

  async sendWhatsAppMessage(to, templateName, bodyParams = [], mediaUrl = "https://www.goutamischools.com/assets/img/logo/logo.png") {
    try {
      const payload = {
        messages: [
          {
            from: this.sender,
            to: "91" + to,
            content: {
              templateName: templateName,
              templateData: {
                body: {
                  placeholders: bodyParams
                },
                header: {
                  type: "IMAGE",
                  mediaUrl: mediaUrl || ""
                }
              },
              language: "en"
            }
          }
        ]
      };
      console.log('Payload:', payload);
      console.log('Payload content:', payload.messages[0].content);
      console.log('Payload content placeholders:', payload.messages[0].content.templateData.body.placeholders);
      const response = await axios.post(this.INFOBIP_URL, payload, {
        headers: {
          Authorization: this.AUTH_HEADER,
          'Content-Type': 'application/json'
        }
      });

      console.log('WhatsApp message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:');
      console.error('  Status:', error.response?.status);
      console.error('  URL:', this.INFOBIP_URL);
      console.error('  Error:', error.response?.data || error.message);
      
      // Check if it's a configuration issue
      if (!this.apiKey || !this.sender) {
        console.error('  Configuration Error: API Key or Sender not set in environment variables');
      }
      
      throw error;
    }
  }

  async sendAbsenteeNotification(parentPhone, studentName, className, date, mediaUrl = "") {
    // Remove any existing country code prefix and let sendWhatsAppMessage add "91"
    const cleanPhone = parentPhone.replace(/^\+?91/, '').replace(/^0/, '');
    
    // Template parameters for absentee notification
    const templateName = "absentee_notification"; // Replace with your actual template name
    const bodyParams = [
      studentName, 
      //className, 
      date]; // Adjust as per your template
    
    return await this.sendWhatsAppMessage(cleanPhone, templateName, bodyParams, mediaUrl);
  }

  async sendBulkAbsenteeNotifications(absentStudents) {
    const results = [];
    
    for (const student of absentStudents) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting - 1 second delay
        
        const result = await this.sendAbsenteeNotification(
          student.parent_phone,
          student.name,
          student.class_name,
          student.date,
          student.mediaUrl || "https://www.goutamischools.com/assets/img/logo/logo.png"
        );
        
        results.push({
          student: student.name,
          phone: student.parent_phone,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          student: student.name,
          phone: student.parent_phone,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

module.exports = WhatsAppService;