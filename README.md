# CyberScreenPro

## Overview
This project provides backend APIs for managing employee scans and custom keyword filters. It also includes functionality for user authentication, employee management, and sending email notifications.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/softmuneeb/backend-cyber-screen-pro
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage
1. Start the server:
   ```bash
   npm start
   ```
2. Access the APIs using the specified endpoints.

## Backend APIs

### Authentication
- **Signup**
  - **Input:** `name`, `email`, `password`
  - **Output:** `login token`, `confirm email`

- **Login**
  - **Input:** `email`, `password`
  - **Output:** `login token`

### Employee Management
- **Create Employee**
  - **Input:** `name`, `email`, `social links`, `auth token`
  - **Output:** `ok`

- **Get Employees**
  - **Input:** `auth token`
  - **Output:** List of employees

- **Update Employee**
  - **Input:** `employee id`, `name`, `email`, `social links`, `auth token`
  - **Output:** `ok`

- **Delete Employee**
  - **Input:** `employee id`, `auth token`
  - **Output:** `ok`

### Employee Scans
- **Run Employee Scan**
  - **Input:** `employee ID`, `auth token`, `platform: [Facebook, Insta, Twitter]`
  - **Output:** `ok`

- **Get Employee Scan Progress Percentage**
  - **Input:** `employee ID`
  - **Output:** `[Facebook 30%, Insta 50%, Twitter 90%]`

- **Get Employee Scan Report**
  - **Input:** `employee ID`, `auth token`, `platform: [Facebook, Insta, Twitter]`
  - **Output:** `[Facebook: { pos: [{link, img, text},...], neg: [{link, img, text},...] }, Insta, Twitter]`

- **Get Employee Scan Summary**
  - **Input:** `employee ID`, `auth token`, `platform: [Facebook, Insta, Twitter]`
  - **Output:** `[Facebook: { pos: 34, neg: 48, neutral: 126 }, Insta, Twitter]`

### Custom Keyword Filters
- **Create custom keyword filter**
  - **Input:** `auth token`, `positive keywords`, `negative keywords`
  - **Output:** `ok`

- **Update custom keyword filter**
  - **Input:** `auth token`, `positive keywords`, `negative keywords`
  - **Output:** `ok`

### Email Notifications
- **Send an email to the employee about his report**
  - **Input:** `employee ID`, `auth token`
  - **Output:** `ok`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
 