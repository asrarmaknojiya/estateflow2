// index.js (server root)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const routes = require("./routes/index");
const {
  blacklistExpiredTokens,
  deleteOldBlacklistedTokens,
} = require("./utils/tokenCleanup");

dotenv.config();

const port = process.env.PORT || 4500;
const app = express();

// ⭐ Simple clean CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

// CORS error handler
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS blocked: not allowed",
    });
  }
  next(err);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

setInterval(() => {
  blacklistExpiredTokens();
  deleteOldBlacklistedTokens();
}, 60 * 60 * 1000);
