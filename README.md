# blog_platform
Notes Management System 📝
Overview
This is a Notes Management System built with Node.js, Express, MongoDB, and EJS. The application supports user authentication, role-based access control (RBAC), and CRUD operations for managing notes. Admins can view and delete all notes, while regular users can manage their own notes.

Tech Stack
Backend: Node.js, Express.js
Frontend: EJS, HTML, CSS, JavaScript
Database: MongoDB Atlas
Authentication: Express Session & bcrypt

Installation

1️⃣ Clone the Repository
git clone https://github.com/your-username/notes-management.git
cd notes-management

2️⃣ Install Dependencies
sh
npm install

3️⃣ Configure Environment Variables
Create a .env file in the project root and add the following:
.env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key

4️⃣ Start the Server
npm start
The application will be running at http://localhost:3000
