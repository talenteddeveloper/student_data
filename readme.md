# Student Data Application

This is a simple Node.js application that uses Express and MySQL to allow users to register schools, add webhook events to schools, and add students to schools.

## Prerequisites

- Node.js installed on your system
- A MySQL database set up with `schools` and `students` tables
- An `.env` file in the project root with the following variables set:
  - `DATABASE_HUST`: The hostname of your MySQL database
  - `DATABASE_PORT`: The port number of your MySQL database
  - `DATABASE_USER`: The username to use when connecting to your MySQL database
  - `DATABASE_PASSWORD`: The password to use when connecting to your MySQL database
  - `DATABASE`: The name of your MySQL database

## Running the application

1. Install the dependencies by running `npm install` in the project root.
2. Start the application by running `node index.js` in the project root.
3. The application will start listening for incoming requests on port `3100`.

## Using the application

The application has three routes that you can use:

- `POST /registerSchool`: Allows you to register a new school by sending a JSON object in the request body with a `schoolName` property.
- `POST /addWebhookEvent`: Allows you to add a webhook event to a school by sending a JSON object in the request body with `schoolId`, `eventName`, and `endpointUrl` properties.
- `POST /addStudent`: Allows you to add a student to a school by sending a JSON object in the request body with `name`, `age`, and `schoolId` properties.
