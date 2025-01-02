const { default: axios } = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer Transporter
const fromEmail = process.env.EMAIL;
const EMAIL_DEV = process.env.EMAIL_DEV;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fromEmail,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: fromEmail,
    to,
    subject,
    text,
  };

  console.log(`sendEmail, to ${to}, subject ${subject}, text ${text}`);

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(
        `email ${err?.message} ${JSON.stringify(err?.response?.data, 0, 2)}`,
      );
    } else {
      console.log('Email sent');
    }
  });
};
// sendEmail('thinkmuneeb@gmail.com', 'Salam', 'May Allah bless you! Amen.'); // unit test

const messageTelegram = async (chatId, message) => {
  try {
    console.log('sendMessage', { message, chatId });
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      },
    );
  } catch (error) {
    console.error('Error sendMessage:', error?.message, error?.response?.data);
  }
};

const messageDev = (text) => {
  if (process.env.LOCAL) {
    return console.log('Email, TG sent to dev: ', text);
  }
  sendEmail(EMAIL_DEV, 'cyber screen pro', text);
  messageTelegram(6687923716, `cyber screen pro: ${text}`);
};
// messageDev(`aoa`); // unit test

module.exports = { sendEmail, messageDev };
