# Connector Service Darwin

This service acts as a connector between Telegram and the Bot Service, managing bidirectional communication between Telegram users and the message processing system.

## Project Structure

```
ConnectorServiceDarwin/
├── config/
│   └── bot.config.js         # Bot configuration and environment variables
├── controllers/
│   └── bot.controller.js     # Controllers for commands and messages
├── routes/
│   └── api.routes.js         # API routes
├── services/
│   └── bot.service.js        # Main bot logic and utility functions
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment variables example
├── .gitignore              # Files and folders ignored by git
├── index.js                # Application entry point
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Telegram bot token
- Bot Service URL

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ConnectorServiceDarwin
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables example file:
```bash
cp .env.example .env
```

4. Configure the environment variables in the `.env` file:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
BOT_SERVICE_URL=http://localhost:5000
PORT=3000
AUTH_KEY=your_auth_key
```

## Features

### Bot Commands
- `/start`: Initiates the conversation with the bot
- `/help`: Shows available commands and usage instructions
- `/report`: Shows a summary of expenses recorded in the last 24 hours

### API Endpoints
- `GET /`: Root endpoint that confirms the service is running
- `GET /health`: Health endpoint that verifies bot status

### Features
- Text message handling
- Detailed interaction logging
- Robust error handling
- Bot Service communication
- Bot status verification
- Graceful shutdown
- API Authentication
- Daily expense reporting

## Authentication

All requests to the Bot Service include an `Authorization` header with the value matching the `AUTH_KEY` environment variable. This ensures that only authorized services can communicate with the Bot Service.

## Development

To start the service in development mode:
```bash
npm start
```

## Logs
The service provides detailed logs for:
- Express server startup
- Telegram bot status
- Messages received and sent
- Errors and exceptions
- Bot Service communication

## Error Handling
The service includes error handling for:
- Telegram connection failures
- Bot Service communication errors
- Invalid or unsupported messages
- Authentication issues

## Security
- Environment variables for sensitive data
- Incoming message validation
- Secure token and credential handling
- API authentication with the Bot Service

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Testing

### Test Server

The project includes a test server that simulates the Bot Service for testing purposes. The test server provides endpoints that match the production Bot Service and includes mock user data for testing different scenarios.

#### Starting the Test Server

```bash
npm run test:server
```

The test server will:
- Start on port 5000 (configurable via TEST_SERVER_PORT in .env)
- Display available endpoints and mock user data
- Auto-shutdown after:
  - Processing 4 test requests, or
  - 2 minutes of inactivity
- Show a session summary when shutting down

#### Available Test Endpoints

- `GET http://localhost:5000/` - Server status and configuration
- `GET http://localhost:5000/health` - Health check endpoint
- `POST http://localhost:5000/api/process-message` - Message processing endpoint

#### Mock Users for Testing

- Whitelisted User: `123456789`
- Non-whitelisted User: `987654321`

### Running Tests

To execute the automated test requests:

```bash
npm run test:requests
```

This will run a series of test cases against the test server, including:
- Health check verification
- Message processing with whitelisted user
- Message processing with non-whitelisted user
- Invalid request handling

#### Test Workflow

1. Start the test server in one terminal:
   ```bash
   npm run test:server
   ```

2. Open another terminal and run the tests:
   ```bash
   npm run test:requests
   ```

3. The test server will automatically shut down after all tests are completed or after the timeout period.

### Manual Testing

You can also test the endpoints manually using curl:

```bash
# Check server status
curl http://localhost:5000/

# Health check
curl http://localhost:5000/health

# Send a message (whitelisted user)
curl -X POST http://localhost:5000/api/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: your_auth_key" \
  -d "{\"telegram_id\":\"123456789\",\"message\":\"hello\"}"

# Send a message (non-whitelisted user)
curl -X POST http://localhost:5000/api/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: your_auth_key" \
  -d "{\"telegram_id\":\"987654321\",\"message\":\"hello\"}"

# Request a daily report (whitelisted user)
curl -X POST http://localhost:5000/api/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: your_auth_key" \
  -d "{\"telegram_id\":\"123456789\",\"message\":\"/report\"}"
```

Note: For Windows PowerShell, use this format for POST requests:
```powershell
curl -X POST http://localhost:5000/api/process-message -H "Content-Type: application/json" -H "Authorization: your_auth_key" -d "{\"telegram_id\":\"123456789\",\"message\":\"hello\"}"
``` 