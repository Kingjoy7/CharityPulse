const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));     
app.use('/api/pledges', require('./routes/pledges')); 
app.use('/api/mfa', require('./routes/mfa'));
app.use('/api/reports', require('./routes/reports')); 
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));


module.exports = app; 