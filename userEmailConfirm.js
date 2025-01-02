require('dotenv').config();
const { FRONTEND } = process.env;

const userEmailConfirm = async (req, res, usersCollection) => {
  const { code } = req.params;

  // Find the user with the confirmation code
  const user = await usersCollection.findOne({ confirmationCode: code });
  if (!user) {
    return res.status(404).json({ message: 'Invalid confirmation code' });
  }

  // Update user's confirmed status
  await usersCollection.updateOne(
    { _id: user._id },
    { $set: { confirmed: true } },
  );

  res.redirect(`${FRONTEND}/component/login?message=email_confirmed`);
};

module.exports = userEmailConfirm;
