# GeoTend PRD

## Product Summary

GeoTend is a university attendance platform designed to replace manual sign-in and proxy attendance with a secure, location-verified, QR-authenticated system.

The product helps lecturers run class sessions more reliably and gives students a simple way to confirm attendance using their device, location, and a rotating QR code.

---

## 1. Problem Statement

Traditional attendance methods in universities are often slow, unreliable, and easy to manipulate. Students may sign for absent friends, attendance records may be incomplete, and lecturers may not have a clean system for tracking participation.

GeoTend solves this by combining:
- GPS-based location validation
- QR-code-based attendance confirmation
- secure login for students and lecturers
- analytics and reporting for lecturers

---

## 2. Product Vision

To create a trusted university attendance system that makes participation more transparent, secure, and easier to manage for both lecturers and students.

---

## 3. Goals

### Primary Goals
- Make attendance harder to fake
- Ensure students are physically present before attendance is marked
- Give lecturers a reliable tool for managing sessions
- Help lecturers communicate with students through announcements and class materials
- Give students a simple and clear way to join class and review attendance history

### Success Metrics
- Attendance is verified using location and QR logic
- Lecturers can start sessions and view attendance records quickly
- Students can join a class from a session code and complete attendance with minimal friction
- Lecturers can export attendance records in CSV format
- Students can view their attendance history clearly

---

## 4. Users

### Lecturer / Teacher
A lecturer creates sessions, defines the attendance zone, monitors participation, and shares course information.

### Student
A student joins a class, confirms their presence through location validation, receives a rotating QR code, and marks attendance.

---

## 5. Core Features

### Teacher Features
- Register and log in with institutional university details
- Start a class session
- Define the attendance location / geofence
- Generate or share a session code
- View active attendance status
- View analytics for each session
- Export attendance data as CSV
- Post announcements
- Share class tests and notices
- Upload slides and PDF materials

### Student Features
- Register and log in with institutional university details
- Join a class using a session code
- Allow location access on their device
- Confirm that they are within the approved class area
- Receive a unique rotating QR code
- Scan or use the QR code to mark attendance
- View past attendance records

---

## 6. User Flow

### Teacher Flow
1. Lecturer registers and logs in
2. Lecturer starts a new session
3. Lecturer defines the class area and session details
4. Lecturer shares the session code with students
5. Lecturer monitors attendance and views analytics
6. Lecturer exports records or shares announcements/materials

### Student Flow
1. Student registers and logs in
2. Student joins a class using the session code
3. Student allows GPS access
4. System checks whether the student is inside the class location
5. If verified, a unique QR code appears
6. Student uses the QR code to mark attendance
7. Student can review their attendance history later

---

## 7. Front-End Requirements (React)

### Pages
- Login page
- Registration page
- Teacher dashboard
- Teacher session creation page
- Teacher live attendance page
- Teacher analytics page
- Teacher announcements/materials page
- Student dashboard
- Student join class page
- Student attendance page
- Student history page

### Front-End Expectations
- Simple and modern UI
- Responsive design for mobile and desktop
- Clear role-based navigation for teachers and students
- Smooth user experience for login, joining class, and attendance marking
- Clear feedback for success, loading, and error states

---

## 8. Back-End Requirements (Django)

### Authentication
- Secure registration and login
- Institutional email validation
- Role-based access control for teachers and students

### Attendance Logic
- Validate student location on the server
- Reject attendance if the student is outside the permitted geofence
- Generate QR codes that are unique and time-based
- Prevent duplicate attendance marking
- Record attendance status as present, rejected, or flagged

### Communication Features
- Allow lecturers to post announcements
- Allow lecturers to upload slides and PDF files
- Allow students to view shared materials

### Reporting
- Generate analytics data for each session
- Export attendance data as CSV

---

## 9. Database Design

### Users
- id
- full_name
- email
- password_hash
- role
- institution_id
- is_verified
- created_at

### Courses
- id
- course_code
- course_title
- teacher_id
- created_at

### Enrollments
- id
- course_id
- student_id
- enrolled_at

### Sessions
- id
- course_id
- teacher_id
- join_code
- room_name
- geofence_latitude
- geofence_longitude
- radius_meters
- start_time
- end_time
- status

### Attendance Records
- id
- session_id
- student_id
- status
- marked_at
- location_verified
- qr_token_used

### Announcements and Materials
- id
- course_id
- title
- content
- type
- file_url
- created_at

---

## 10. Security Requirements

- Only institutional university emails should be allowed
- Passwords must be securely hashed
- GPS location must be validated on the server, not trusted from the client alone
- QR codes should be time-limited and unique
- Prevent multiple attendance attempts for the same student in one session
- Detect suspicious attempts such as fake location or VPN use where possible
- Restrict teacher-only actions to lecturer accounts

---

## 11. Technical Direction

### Front-End
- React
- React Router
- Responsive UI components
- Role-based views

### Back-End
- Django
- Django REST Framework
- Authentication and authorization
- API endpoints for sessions, attendance, announcements, and materials

### Database
- PostgreSQL

---

## 12. Development Phases

### Phase 1
- Authentication
- Teacher and student dashboards
- Session creation

### Phase 2
- GPS validation
- QR attendance flow
- Student join flow

### Phase 3
- Analytics and CSV export
- Announcements and materials

### Phase 4
- Security hardening and performance improvements

---

## 13. Final Note

GeoTend is a modern attendance solution built for universities that need a more trustworthy, efficient, and secure way to manage class participation.

It combines the reliability of GPS verification with the simplicity of QR-based attendance, while also giving lecturers tools for communication and reporting.
