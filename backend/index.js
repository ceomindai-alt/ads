require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 5000;

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
connectDB(process.env.MONGO_URI);

// middlewares

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://pagead2.googlesyndication.com",
          "https://googleads.g.doubleclick.net",
          "https://www.googletagservices.com"
        ],
        "frame-src": [
          "'self'",
          "https://googleads.g.doubleclick.net",
          "https://tpc.googlesyndication.com"
        ],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https:"]
      }
    }
  })
);
app.use("/r", (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});



app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true, // 🔴 REQUIRED
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});
app.use(limiter);

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));
app.use('/r', require('./routes/redirect'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/withdraw', require('./routes/withdraw'));
app.use('/api/user', require('./routes/user'));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/referrals", require("./routes/referrals"));
app.use("/api/admin/cpm", require("./routes/adminCpm"));


app.get('/', (req, res) => res.send('LinkPay API running'));




if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.get( (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
  });
}


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
