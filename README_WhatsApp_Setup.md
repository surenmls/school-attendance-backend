# WhatsApp Absentee Notification System

This system automatically sends WhatsApp messages to parents when their children are marked absent, using Infobip's WhatsApp API.

## Features

- **Daily Cron Job**: Runs every day at 10:00 AM to check for absent students
- **WhatsApp Integration**: Uses Infobip API to send WhatsApp messages to parents
- **Rate Limiting**: 1-second delay between messages to respect API limits
- **Error Handling**: Comprehensive error logging and fallback mechanisms
- **Manual Testing**: API endpoint to manually trigger notifications for testing

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Infobip WhatsApp API Configuration
INFOBIP_BASE_URL=https://api.infobip.com
INFOBIP_API_KEY=your_infobip_api_key_here
INFOBIP_SENDER=your_whatsapp_sender_number_here
```

### 2. Get Infobip Credentials

1. Sign up at [Infobip](https://www.infobip.com/)
2. Navigate to WhatsApp section
3. Get your API key from the dashboard
4. Set up your WhatsApp sender number (this requires approval from Infobip)

### 3. Database Setup

Run the SQL script to add parent information to the users table:

```sql
-- Run this in your PostgreSQL database
\i scripts/updateUsersTable.sql
```

### 4. Start the Server

```bash
npm run dev
```

The cron job will automatically start when the server starts.

## API Endpoints

### Manual Test Notification
```
POST /api/notifications/test-absentee
```
Manually triggers the absentee notification process for testing.

### Check Cron Status
```
GET /api/notifications/status
```
Returns the current status of the cron job.

## How It Works

1. **Daily Trigger**: At 10:00 AM every day, the cron job triggers
2. **Fetch Absent Students**: Queries the database for students marked absent today
3. **Parent Lookup**: Gets parent phone numbers for each absent student
4. **Send Messages**: Sends personalized WhatsApp messages to each parent
5. **Rate Limiting**: Waits 1 second between each message to avoid API limits
6. **Logging**: Logs all results (success/failure) for monitoring

## Message Template

```
Dear Parent,

Your child [Student Name] from [Class] was marked absent today ([Date]).

If this is unexpected, please contact the school administration.

Thank you,
School Administration
```

## Testing

1. **Manual Test**: Use the `/api/notifications/test-absentee` endpoint
2. **Database Test**: Add some absent records for today and run the manual test
3. **Dummy Data**: The system includes dummy data for testing when database is empty

## Troubleshooting

### Common Issues

1. **No messages sent**: Check if INFOBIP_API_KEY is correctly set
2. **Authentication errors**: Verify your API key is valid and active
3. **No absent students**: Check if attendance records exist for today
4. **Rate limiting**: The system includes 1-second delays between messages

### Logs

Check server console for detailed logs including:
- Cron job status
- Number of absent students found
- WhatsApp API responses
- Error messages and stack traces

## Production Considerations

1. **Phone Number Format**: Ensure parent phone numbers are in international format (e.g., +919876543210)
2. **WhatsApp Business**: For production, use WhatsApp Business API with proper approval
3. **Rate Limits**: Infobip has rate limits; adjust delays if needed
4. **Error Monitoring**: Implement proper error monitoring and alerting
5. **Backup Notifications**: Consider SMS fallback if WhatsApp fails

## Dependencies

- `node-cron`: For scheduling daily tasks
- `axios`: For HTTP requests to Infobip API
- `dotenv`: For environment variable management