const { ObjectId } = require('mongodb');

const employeeGet = async (req, res, employeesCollection) => {
  try {
    const employeeId = req.params.id;
    const employee = await employeesCollection.findOne({
      _id: new ObjectId(employeeId),
      userId: req.userId,
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get employee', error: error.message });
  }
};
module.exports = employeeGet;
