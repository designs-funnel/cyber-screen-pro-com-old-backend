const employeesGet = async (req, res, employeesCollection) => {
  try {
    const employees = await employeesCollection
      .find({ userId: req.userId })
      .toArray();
    res.status(200).json(employees);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get employees', error: error.message });
  }
};
module.exports = employeesGet;
