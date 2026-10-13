Campus Action
An Intelligent Circular-to-Action Management System for Personalized Student Notifications
Campus Action is a full-stack web application that helps colleges manage
campus circulars and student activities from one place. Administrators
can publish circulars and manage announcements, while students can view
relevant information, track assigned action items and deadlines, receive
notifications, and access event-registration features.
Features
Authentication: User registration and login.
Role-based access: Separate access for administrators and
students.
Circular management: Create, view, update, and delete campus
circulars according to permissions.
Automatic student actions: Published circulars can generate
action items for matching students.
Notifications: Notify users about relevant published circulars.
Action tracking: View action items and track their status.
Event registration: Support for event-registration functionality
and related counts.
Dashboard: Frontend interface for accessing campus information
and actions.
Technology Stack
Layer                              Technologies
---
Frontend                           React, Vite, JavaScript, CSS
Backend                            Java, Spring Boot, Maven
Database                           MySQL
Authentication and authorization   JWT, Spring Security
API testing                        Postman
Project Structure
``` text
Campus-Action/
├── backend/
│   ├── src/main/java/com/campusaction/backend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   └── repository/
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```
Prerequisites
Install the following before running the project:
Java JDK compatible with the backend configuration
Maven (or use the project's Maven Wrapper if available)
Node.js and npm
MySQL Server
Git
Setup and Run
1. Clone the repository
``` bash
git clone https://github.com/snehithachintham0204/Campus-Action.git
cd Campus-Action
```
2. Configure the MySQL database
Start MySQL Server.
Create the database:
``` sql
CREATE DATABASE campus_action;
```
Configure the database URL, username, and password in the backend's
`application.properties` or through environment variables, depending
on the application's configuration.
Do not commit real database passwords, JWT secrets, or other
credentials to GitHub.
Check the existing backend configuration for the required property names
and any additional database setup.
3. Run the backend
Open a terminal in the project root and run:
``` bash
cd backend
mvn spring-boot:run
```
The backend is expected to run at:
``` text
http://localhost:8080
```
4. Run the frontend
Open a second terminal from the project root and run:
``` bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite in the terminal, commonly:
``` text
http://localhost:5173
```
If the frontend uses a different port, use the URL shown in the
terminal.
API Overview
The backend exposes REST APIs. The following routes are known parts of
the project:
---
Method                  Endpoint                Purpose
---
POST                    `/api/auth/register`    Register a student
account
POST                    `/api/auth/login`       Log in and obtain an
authentication token
GET                     `/api/circulars`        Retrieve circulars
POST                    `/api/circulars`        Create a circular
(administrator access
required)
GET                     `/api/circulars/{id}`   Retrieve a circular by
ID
PUT                     `/api/circulars/{id}`   Update a circular
(administrator access
required)
DELETE                  `/api/circulars/{id}`   Delete a circular
(administrator access
required)
Additional action, notification, and event-registration endpoints are
implemented in the backend. Check the controller classes for their exact
paths and request formats.
For protected APIs, log in and send the returned JWT as a bearer token
in the `Authorization` header:
``` text
Authorization: Bearer <your-token>
```
Typical Workflow
An administrator signs in and publishes a campus circular.
The system identifies students who match the circular's target
department and year.
The system creates applicable action items and notifications.
Students sign in to view circulars, notifications, and assigned
actions.
Students track the status of their action items and access
event-registration features.
Security Notes
Keep database credentials and JWT secrets private.
Do not upload `.env` files or local configuration files containing
secrets.
Use an appropriately configured production database and HTTPS when
deploying.
Review role permissions before deploying the application publicly.
Future Enhancements
Email or push notifications
Search and filtering for circulars
Advanced analytics for administrators
Improved mobile-responsive interface
Deployment monitoring and automated tests
Author
Snehitha Chintham
GitHub: snehithachintham0204
---
Campus Action aims to make campus communication more organized,
personalized, and actionable.
