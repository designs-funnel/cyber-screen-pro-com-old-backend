const { ObjectId } = require('mongodb');

const employeeDelete = async (req, res, employeesCollection) => {
  try {
    const employeeId = req.params.id;
    const result = await employeesCollection.deleteOne({
      _id: new ObjectId(employeeId),
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to delete employee', error: error.message });
  }
};

module.exports = employeeDelete;
