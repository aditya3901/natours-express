const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api/v1/users', limiter);

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json());

// Data sanitization against NoSQL query injection
// eg: LOGIN => { "email": { "$gt": "" }, "password": "test123" }
app.use(mongoSanitize());

// Data sanitization against XSS (cross site scripting) attack
// eg: SIGNUP => { "email": "test@gmail.com", "password": "test123", "name": "<div id='some-bad-stuff'>Name</div>" }
app.use(xss());

// Prevent Parameter Pollution, hpp => HTTP parameter pollution
// eg: Query => {{URL}}api/v1/tours?sort=duration&sort=price&sort=createdAt
app.use(
  hpp({
    // ALLOWED => {{URL}}api/v1/tours?duration=5&duration=9
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
      'maxGroupSize',
    ],
  })
);

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
