require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
connectDB(process.env.MONGO_URI);

// middlewares
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use(
  cors({
    origin: [
      "https://ads-1-lnqy.onrender.com",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
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


app.get('/', (req, res) => res.send('LinkVerse API running'));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
