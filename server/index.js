// server/app.js (entry)
const connection = require("./connection/connection");
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const users=require("./routes/users/user");
const role=require("./routes/users/role");
const properties = require("./routes/properties/properties"); // adjust path

dotenv.config();

const port = process.env.PORT || 4500;
const URL = process.env.URL || `http://localhost:${port}`;


dotenv.config();
const authRoutes = require('./routes/authRoutes/authRoutes');
const { blacklistExpiredRefresh, deleteBlacklistedOlder } = require('./utils/tokenCleanup');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/',users);
app.use('/',role);


// mount auth routes at /auth
app.use('/', authRoutes);
app.use('/',properties)

// server listen (pool already connects on module load)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// run cleanup tasks every hour (after server up)
setInterval(() => {
  blacklistExpiredRefresh();
  deleteBlacklistedOlder();
}, 60 * 60 * 1000);
