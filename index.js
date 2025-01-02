const fs = require('fs');
const cors = require('cors');
const express = require('express');

require('dotenv').config();
const userRegister = require('./userRegister');
const employeeCreate = require('./employeeCreate');
const connectToDatabase = require('./utilConnectToDatabase');

const emp = require('./routes/employeeScan');
const employeeGet = require('./employeeGet');
const employeesGet = require('./employeesGet');
const employeeDelete = require('./employeeDelete');
const employeeUpdate = require('./employeeUpdate');
const userLogin = require('./userLogin');
const userEmailConfirm = require('./userEmailConfirm');
const auth = require('./auth');

const { ObjectId } = require('mongodb');
const americanDate = require('./utilAmericanDate');
const userGetInfo = require('./userGetInfo');
const { countByLabel, missing, time } = require('./util');
const { messageDev } = require('./utilEmailSend');

let client;
const dbName = 'db1';
const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());
app.set('json spaces', 2);
app.use((err, req, res, next) => {
  console.error(err?.stack);
  res.status(500).send('Some issue bro!');
});

const env_vars = [
  'MONGO_URL',
  'EMAIL',
  'EMAIL_PASS',
  'FRONTEND',
  'BACKEND',
  'JWT_SECRET',
  'GEMINI_GPT_API',
  'APIFY_API',
  'RAPID_API_KEY',
  'POSTS_LIMIT',
  'EMAIL_DEV',
  'TELEGRAM_BOT_TOKEN',
];
if (missing(env_vars)) return;

console.log('⏳ Connecting to db please wait...');
connectToDatabase()
  .then(async (mongoClient) => {
    client = mongoClient;
    const db = client.db(dbName);
    const usersCollection = db.collection('usersCollection');
    const employeesCollection = db.collection('employeesCollection');
    const reportsCollection = db.collection('reportsCollection');

    // DB connected lala
    // const employeeId = '66054018d1dc337a297d52c2';
    // await employeesCollection.updateOne(
    //   { _id: new ObjectId(employeeId) },
    //   { $set: { lastScannedOn: Date.now() } },
    // ); const empUp = await employeesCollection.findOne({
    //   _id: new ObjectId(employeeId),
    // }); console.log({ empUp });

    // Users Management
    app.post('/save-keywords-filter', auth, async (req, res) => {
      emp.saveKeywordsFilter(req, res, usersCollection);
    });

    app.post('/user-register', async (req, res) => {
      userRegister(req, res, usersCollection);
    });

    app.get('/user-confirm-email/:code', async (req, res) => {
      userEmailConfirm(req, res, usersCollection);
    });

    app.get('/user-get-info', auth, async (req, res) => {
      userGetInfo(req, res, usersCollection);
    });

    app.post('/user-login', async (req, res) => {
      userLogin(req, res, usersCollection);
    });

    // Employees Management
    app.get('/employee-get/:id', auth, async (req, res) => {
      employeeGet(req, res, employeesCollection);
    });

    app.get('/employees-get', auth, async (req, res) => {
      employeesGet(req, res, employeesCollection);
    });

    app.put('/employee-update/:id', auth, async (req, res) => {
      employeeUpdate(req, res, employeesCollection);
    });

    app.post('/employee-create', auth, async (req, res) => {
      employeeCreate(req, res, employeesCollection);
    });

    app.delete('/employee-delete/:id', auth, async (req, res) => {
      employeeDelete(req, res, employeesCollection);
    });

    // Employees Online Screening
    app.post('/employee-scan/run', auth, async (req, res) => {
      const { employeeId } = req.body;
      const message = await emp.runEmployeeScan(employeeId);
      res.status(200).json({ message });
    });

    // Get Employee Scan Progress Percentage
    app.get('/employee-scan-progress/:employeeId', auth, async (req, res) => {
      const { employeeId } = req.params;
      const progress = await emp.getEmployeeScanProgress(employeeId);
      res.status(200).json({ progress });
    });

    const scanTheEmployee = async (employeeId, userId) => {
      const _id = new ObjectId(employeeId);
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      const employee = await employeesCollection.findOne({ _id, userId });

      if (employee?.scanInProgress) {
        throw new Error(`Scan is already in progress`);
      }
      employeesCollection.updateOne(
        { _id },
        {
          $set: {
            scanInProgress: true,
          },
        },
      );

      const report = await emp.getEmployeeScanReport(employee, user);

      // TODO: get set variables make and should switchable from db to memory and vice versa
      employeesCollection.updateOne(
        { _id },
        {
          $set: {
            lastScannedOn: americanDate(),
            user_image:
              report?.userProfiles?.[0]?.user_image ||
              report?.userProfiles?.[1]?.user_image,
            counts: countByLabel(report?.posts),
            posts_count: report?.posts?.length,
            scanInProgress: false,
          },
        },
        { upsert: true },
      );
      reportsCollection.updateOne(
        { _id },
        { $set: { report } },
        { upsert: true },
      );

      return report;
    };
    // scanTheEmployee();

    // Get Employee Scan Report
    app.post('/employee-scan-report/:employeeId', auth, async (req, res) => {
      const { userId } = req;
      const { useCache } = req.body;
      const { employeeId } = req.params;

      if (!employeeId || employeeId === '')
        return res.status(404).json({ message: `Provide employeeId` });

      let _id;
      try {
        _id = new ObjectId(employeeId);
        const employee = await employeesCollection.findOne({ _id, userId });
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
      } catch (error) {
        return res.status(404).json({ message: 'id incorrect for employee' });
      }

      if (useCache) {
        const report = await reportsCollection.findOne({ _id });
        if (report) return res.status(200).json({ ...report });
      }

      try {
        console.log(`${time()} hi start scanTheEmployee(${employeeId}) `);
        await scanTheEmployee(employeeId, userId, useCache);
        res.status(200).json({ ok: 'ok' });
      } catch (e) {
        employeesCollection.updateOne(
          { _id },
          {
            $set: {
              scanInProgress: false,
            },
          },
          { upsert: true },
        );

        const message = e?.message;
        const data = e?.response?.data;

        const errLog = JSON.stringify(
          {
            date: time(),
            message,
            data,
          },
          0,
          2,
        );
        console.log(errLog);

        if (data?.message?.includes('You have exceeded the MONTHLY quota')) {
          messageDev(errLog);
        }

        res.status(404).json({
          message,
          data,
        });
      } finally {
        console.log(
          `${time()} hi end scanTheEmployee(${employeeId}, ${userId}, ${useCache}) `,
        );
      }
    });

    // Get Employee Scan Summary
    app.get('/employee-scan-summary/:employeeId', auth, async (req, res) => {
      const { employeeId } = req.params;
      const summary = await emp.getEmployeeScanSummary(employeeId);
      res.status(200).json({ summary });
    });

    // Send an email to the employee about his report
    app.post('/employee-send-email/:employeeId', auth, async (req, res) => {
      const { employeeId } = req.params;
      const message = await emp.sendEmailToEmployee(employeeId);
      res.status(200).json({ message });
    });

    // General
    app.get('/', async (req, res) => {
      res.status(200).json({ message: '🏃 Server is running' });
    });

    app.listen(PORT, () => {
      messageDev(
        'O Allah please send peace and blessing upon final prophet ❤️',
      ); // unit test
      console.log(`🏃 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error Bro MongoDB:', err?.message);
    process.exit(1);
  });
