const express = require('express');
const router = express.Router();

// Define the API endpoint
router.post('/v1/GetContactInfo', (req, res) => {
    const { qrCode } = req.body;
    //use the value passed into the api call to fetch the customer info
    //TODO: fetch the customer info from another API or database
    


    // Simulate fetching customer info based on the QR code
    const customerInfo = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123-456-7890',
      email: 'john.doe@example.com',
      companyName: 'Example Corp'
    };
    res.json(customerInfo);
});

module.exports = router;