const axios = require('axios');

const url = 'http://localhost:8000/api/create-product';

// Additional headers
const headers = {
  'Content-Type': 'application/json',
  // Add any other headers as needed
};

async function sendRequest(productName) {
  const data = {
    name: productName,
    amount: 13,
    productTypeId: 1,
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to send the request multiple times
async function sendMultipleRequests(times) {
  for (let i = 1; i <= times; i++) {
    const productName = `ASUS Vivobook S${i}`;
    console.log(`Sending request ${i} with product name: ${productName}`);
    await sendRequest(productName);
  }
}

// Adjust the number of times you want to send the request
const numberOfRequests = 1000;
sendMultipleRequests(numberOfRequests);
