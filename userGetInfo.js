const { ObjectId } = require('mongodb');

const userGetInfo = async (req, res, usersCollection) => {
  const { userId } = req;
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ ...user });
};

module.exports = userGetInfo;
