# Community.js
Community.js is a lightweight library that provides essential user authentication and role-based access control for Node.js applications. It supports SQLite for database integration and includes user registration, login, and access management features.

## Features
- User registration with roles (default: `user`)
- Secure user authentication
- SQLite database integration
- Minimal setup

## Installation
To install Community.js from NPM, run:
`npm i @loganpaxton/communityjs`

## Getting Started
Here's how to set up and use Community.js in a few simple steps:

### 1. Initalize the Project
Create a new directory and initalize an NPM project
```
mkdir my-community-app
cd my-community-app
npm init -y
```
Install Community.js
```
npm i @loganpaxton/communityjs
```

### 2. Create a Server
Create a new file, `app.js`, and set up your server using Community.js:
```javascript
const express = require('express');
const community = require('community.js');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
community.initialize(app); // Initializes Community.js routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```
Run your server
`node app.js`

## Examples
### Register a User
Use a tool like cURL or Postman to send a POST request to the `/register` endpoint:
```bash
curl -X POST http://localhost:3000/register \
-H "Content-Type: application/json" \
-d '{ "username": "exampleUser", "password": "123456" }'
```
Response:
```
{
  "message": "User registered successfully.",
  "userId": 1
}
```
### Login as a User
Send a POST request to the `/login` endpoint:
```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{ "username": "exampleUser", "password": "123456" }'
```
Response:
```
{
  "message": "Login successful.",
  "user": {
    "id": 1,
    "username": "exampleUser",
    "role": "user"
  }
}
```
### Fetch all Users (Admin-Only)
Send a GET request to the `/users` endpoint:
```bash
curl -X GET http://localhost:3000/users \
-H "Authorization: Bearer <admin-token>"
```
Response:
```
{
  "users": [
    { "id": 1, "username": "exampleUser", "role": "user" }
  ]
}
```

## Contributing
Contributions are welcome! Feel free to submit issues or pull requests on Github.

## License
Community.js is licensed under the MIT license. See the LICENSE file for more details

## Support
If you encounter any issues or have questions, feel free to reach out or open an issue on Github.
