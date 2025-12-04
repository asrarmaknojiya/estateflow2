const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");

const routes = require("./routes/index");
const { blacklistExpiredTokens, deleteOldBlacklistedTokens } = require('./utils/tokenCleanup');

dotenv.config();

const port = process.env.PORT || 4500;

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

setInterval(() => {
  blacklistExpiredTokens();
  deleteOldBlacklistedTokens();
}, 60 * 60 * 1000);
