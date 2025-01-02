const { ObjectId } = require('mongodb');

const employeeUpdate = async (req, res, employeesCollection) => {
  try {
    const employeeId = req.params.id;
    const { name, email, socialLinks } = req.body;
    const updatedEmployee = { name, email, socialLinks };
    const result = await employeesCollection.updateOne(
      { _id: new ObjectId(employeeId) },
      { $set: updatedEmployee },
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update employee', error: error.message });
  }
};

module.exports = employeeUpdate;
