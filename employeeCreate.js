const employeeCreate = async (req, res, employeesCollection) => {
  try {
    const { name, email, socialLinks } = req.body;

    // Validate the request body
    if (!name || !email || !socialLinks) {
      return res.status(400).json({
        message: 'Name, email and socialLinks are required',
      });
    }

    const existing = await employeesCollection.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create a new employee document
    const newEmployee = {
      name,
      email,
      socialLinks,
      userId: req.userId,
    };

    // Insert the new employee document into the collection
    const result = await employeesCollection.insertOne(newEmployee);

    // Respond with the newly created employee document
    res.status(201).json(result);
  } catch (error) {
    // Handle any errors that occur during the creation of the employee
    res
      .status(500)
      .json({ message: 'Failed to create employee', error: error.message });
  }
};

module.exports = employeeCreate;
