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

## API Documentation

The API documentation is available at `/docs` when the application is running. It is generated from the `swagger.yaml` file.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.
