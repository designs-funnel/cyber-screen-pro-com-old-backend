require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const userLogin = async (req, res, usersCollection) => {
  const { email, password } = req.body;

  // Find the user with the provided email
  const user = await usersCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if the password is correct
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // Check if the email is confirmed
  if (!user.confirmed) {
    return res.status(403).json({
      message:
        'Email not confirmed. Please check your email for the confirmation link.',
    });
  }

  // Generate JWT
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '12h', // Token expires in 12 hours
  });

  res.status(200).json({ message: 'Login successful', token });
};

module.exports = userLogin;
