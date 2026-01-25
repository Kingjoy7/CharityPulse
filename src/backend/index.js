const app = require('./server'); // Import the app
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });