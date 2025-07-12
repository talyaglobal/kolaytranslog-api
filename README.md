# Translog API

This is the official API for Translog.

[![Build Status](https://github.com/talyaglobal/kolaytranslog-api/actions/workflows/ci.yml/badge.svg)](https://github.com/talyaglobal/kolaytranslog-api/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [npm](https://www.npmjs.com/)
*   [Docker](https://www.docker.com/) (for running a database)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/talyaglobal/kolaytranslog-api.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env` file from the example
    ```sh
    cp .env.example .env
    ```
4.  Update the `.env` file with your database credentials and other environment variables.

### Running the application

To run the app in development mode:

```sh
npm run dev
```

To build the application for production:

```sh
npm run build
```

To run the production build:

```sh
npm run start
```

## Available Scripts

*   `npm run dev`: Starts the application in development mode with hot-reloading.
*   `npm run build`: Compiles the TypeScript code to JavaScript.
*   `npm run start`: Starts the production-ready application.
*   `npm run lint`: Lints the codebase for potential errors.
*   `npm run lint:fix`: Lints the codebase and automatically fixes issues.
*   `npm run format`: Formats the code using Prettier.

## Project Structure

The project structure is as follows:

```
src/
├── api/
│   ├── controllers/
│   ├── middlewares/
│   └── routes/
├── config/
├── core/
├── database/
├── dtos/
├── repositories/
├── services/
├── types/
└── utils/
```

*   **api**: Contains all the API related logic, including controllers, middlewares, and routes.
*   **config**: Application configuration.
*   **core**: Core application classes, like `ApiResponse` and `AppError`.
*   **database**: Database connection, entities, and migrations.
*   **dtos**: Data Transfer Objects.
*   **repositories**: Repositories for data access.
*   **services**: Business logic.
*   **types**: TypeScript types and interfaces.
*   **utils**: Utility functions.

## Services

### Email Service

The email service provides comprehensive email functionality for the application, including transactional emails and application notifications.

#### Features

- **SMTP Configuration**: Configurable SMTP settings for any email provider
- **Rich HTML Templates**: Professional email templates with inline CSS
- **Plain Text Fallback**: Accessible plain text versions for all emails
- **Document Links**: Secure links to uploaded documents
- **Payment Confirmation**: Detailed payment confirmation emails
- **Error Handling**: Comprehensive error handling and logging

#### Available Email Methods

##### `sendEmail(options: EmailOptions)`
Generic email sending method with full customization options.

```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World</h1>',
  text: 'Hello World',
  attachments: [] // optional
});
```

##### `sendWelcomeEmail(to: string, name: string)`
Sends a welcome email to new users.

```typescript
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');
```

##### `sendApplicationConfirmation(to: string, applicationId: string)`
Sends a basic application confirmation email.

```typescript
await emailService.sendApplicationConfirmation('user@example.com', 'app-123');
```

##### `sendApplication(applicationWithDetails: ApplicationWithDetails, paymentAmount?: number, paymentCurrency?: string)`
Sends a comprehensive application summary email with all details including vessel information, passenger data, and document links. This is typically sent after payment confirmation.

```typescript
// Fetch application with related data
const application = await applicationRepository.findById(id, {
  include: {
    vessels: true,
    passengers: true
  }
});

// Send detailed application email
await emailService.sendApplication(application, 2500, 'usd'); // $25.00 USD
```

##### `sendPasswordReset(to: string, resetToken: string)`
Sends password reset instructions with a secure token.

```typescript
await emailService.sendPasswordReset('user@example.com', 'reset-token-123');
```

#### Email Configuration

Configure email settings in your `.env` file:

```env
# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=TransLog API
EMAIL_FROM_ADDRESS=noreply@translog.com
```

#### Application Email Details

The comprehensive application email includes:

- **Payment Confirmation**: Payment amount and status
- **Application Details**: ID, status, creation date, purpose, notes
- **Vessel Information**: Name, type, length, flag, registration details
- **Captain Information**: Name, nationality, passport details
- **Travel Details**: Departure/arrival ports and dates, crew count
- **Contact Information**: Email and phone details
- **Insurance Policy**: Link to insurance document
- **Passenger List**: Complete passenger details with passport information
- **Document Links**: Secure links to all uploaded documents
- **Next Steps**: Processing timeline and status update information

#### Email Templates

All emails use professional HTML templates with:
- Responsive design for mobile and desktop
- Color-coded sections for easy reading
- Inline CSS for maximum compatibility
- Professional typography and spacing
- Secure document links with expiration notices

#### Error Handling

The email service includes comprehensive error handling:
- Connection verification on startup
- Detailed error logging
- Graceful degradation if email service is unavailable
- Retry logic for transient failures

#### Dependencies

- **nodemailer**: SMTP email sending
- **@types/nodemailer**: TypeScript definitions

## API Documentation

The API documentation is available at `/docs` when the application is running. It is generated from the `swagger.yaml` file.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.
