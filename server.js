const express = require('express');
const os = require('os');
const fs = require('fs');
const json2csv = require('json2csv').parse;
const app = express();
const path = require('path');
const port = 5000;
app.use(express.json());
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));

// Function to generate a random key string of format AAAAAAAA
function generateKeyString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let keyString = '';
  for (let i = 0; i < 8; i++) {
    keyString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return keyString;
}

let keyString = generateKeyString(); // Changing var to let for reassignment

const networkInterfaces = os.networkInterfaces();
let localIPAddress;
for (const key in networkInterfaces) {
  for (const item of networkInterfaces[key]) {
    if (item.family === 'IPv4' && !item.internal) {
      localIPAddress = item.address;
      break;
    }
  }
  if (localIPAddress) {
    break;
  }
}

app.get('/', (req, res) => {
  res.render('index', {
    serverURL: `http://${localIPAddress}:${port}/${keyString}`
  });
});

app.post('/change-keystring', (req, res) => {
  const newKeyString = generateKeyString();
  keyString = newKeyString;
  console.log(`Server running on http://${localIPAddress}:${port}/${keyString}`);
  res.json({ newKeyString });
});

app.get('/get-keystring', (req, res) => {
  res.json({ serverURL: `http://${localIPAddress}:${port}/${keyString}` });
});

app.post('/'+ keyString, (req, res) => {
    const receivedJSON = req.body;
    const dynamicKeyString = req.params.newKeyString; // Retrieve the new keyString from the route parameter
  
    const csvData = `${receivedJSON.name},${receivedJSON.enrollment}\n`; // Format the data for CSV
  
    fs.appendFile(path.join(__dirname, 'output.csv'), csvData, (err) => {
      if (err) {
        console.error('Error appending to CSV file:', err);
        res.status(500).json({ message: 'Failed to append data to CSV' });
      } else {
        console.log('Data appended to output.csv');
        res.status(200).json({ message: 'Appended data to CSV file.' });
      }
    });
  });
  
  

app.get('/download-output', (req, res) => {
    const file = path.join(__dirname, 'output.csv');
    res.download(file);
  });

  app.get('/index', (req, res) => {
    res.render('index', {
        serverURL: `http://${localIPAddress}:${port}/${keyString}`
    });
});

app.listen(port, localIPAddress, () => {
  console.log(`Server running on http://${localIPAddress}:${port}/${keyString}`);
});
