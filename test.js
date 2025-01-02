const axios = require('axios');

const API_URL = 'http://localhost:4000';

(async () => {
  const userData = {
    username: 'jay_shawn',
    email: 'jay_shawn@example.com',
    password: 'hello1234',
  };
  const response = await axios.post(`${API_URL}/user-register`, userData);
  console.log(response.data);
})();
