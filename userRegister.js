const bcrypt = require('bcrypt');
const { sendEmail } = require('./utilEmailSend');

const BACKEND = process.env.BACKEND;

const userRegister = async (req, res, usersCollection) => {
  const { username, email, password } = req.body;

  // Check if the email is already registered
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a random confirmation code
  const confirmationCode = Math.random().toString(36).substring(7);

  // Save the user to the database
  const testing = true;
  await usersCollection.insertOne({
    username,
    email,
    password: hashedPassword,
    confirmed: testing,
    confirmationCode,
  });

  // Send confirmation email
  sendEmail(
    email,
    'Confirm your email',
    `Please click the following link to confirm your email: ${BACKEND}/user-confirm-email/${confirmationCode}`,
  );

  res.status(201).json({
    message: 'User created. Please check your email to confirm your address.',
  });
};

module.exports = userRegister;
