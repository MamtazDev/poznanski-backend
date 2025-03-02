const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const logger = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("./utils/strategies");
const helmet = require("helmet");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const { SSE } = require("./sse/sseServer");
const corsAllowList = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:8000",
  "https://singular-crumble-583e8e.netlify.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (corsAllowList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization", "Csrf-Token"], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
// app
const app = express();

// db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("db connected!");
    console.log(path.join("public", "assets", "img").toString());
  })
  .catch((error) => console.log(`db connection error: ${error}`));

// middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// enable CORS
app.use(cors(corsOptions));
// enable session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cookieParser());

// passport
app.use(passport.initialize());
app.use(passport.session());

// CSRF Protection in headers
const csrfProtection = csrf({
  sessionKey: "session",
  value: (req) => req.headers["Csrf-Token"],
});
app.use(csrfProtection);
app.use((err, req, res, next) => {
  if (req.session.csrfToken) {
    res.cookie("XSRF-TOKEN", req.session.csrfToken);
    // res.setHeader('Csrf-Token', req.session.csrfToken);
  } else {
    const csrfToken = req.csrfToken();
    req.session.csrfToken = csrfToken;
    res.cookie("XSRF-TOKEN", csrfToken);
    // res.setHeader('Csrf-Token', csrfToken);
  }

  next();
});
// throws error if CSRF token in headers is invalid
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403).send("Invalid CSRF token");
  } else {
    next();
  }
});

// routes middleware
// Read the routes directory
fs.readdirSync("./routes").forEach((file) => {
  // Get the base name of the file without the extension
  const routePath = `/api/${path.basename(file, ".js")}`;
  // Dynamically require the route file and use it
  const route = require(`./routes/${file}`);
  app.use(routePath, route);
});

//images
app.use("/img", express.static(path.join("public", "assets", "img")));
// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// test
app.get("/api", (request, response) => {
  response.json({
    data: "u hit node API!",
  });
});

app.get("/api/sse-connect/:userId", SSE.initialize);

// routes protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
