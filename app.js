var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var swaggerUi = require('swagger-ui-express');
var swaggerFile = require('./config/swagger-output.json');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRouter = require('./src/users/user.controller');
var walletRouter = require('./src/wallet/wallet.controller');
var transactionRouter = require('./src/Transaction/transaction.controller');
var moduleInformationRouter = require('./src/ModuleInformation/moduleInformation.controller');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  createParentPath: true // Auto-create upload directory
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', userRouter);
app.use('/', walletRouter);
app.use('/', transactionRouter);
app.use('/', moduleInformationRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
