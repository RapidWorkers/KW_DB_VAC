var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var FileStore = require("session-file-store")(session);

// 1차
var introRouter = require('./routes/intro');
var loginRouter = require('./routes/login');
var vaccRecommendRouter = require('./routes/vacc_recommend');
var reserveSearchHospRouter = require('./routes/reserve_search_hosp');
var reserveSelectDateRouter = require('./routes/reserve_select_date');

var reserveConfirmRouter = require('./routes/reserve_confirm');
var leftVaccSelectRouter = require('./routes/leftvacc_select');
var joinRouter = require('./routes/join');
var emailAuthFinishRouter = require('./routes/email_auth_finish');
var vaccStatRouter = require('./routes/vacc_stat');

var sideEffectStatRouter = require('./routes/side_effect_stat');
var myPageRouter = require('./routes/mypage');
var modifyPersonalRouter = require('./routes/modify_personal');
var groupListRouter = require('./routes/group_list');
var groupMemListRouter = require('./routes/group_mem_list');
var groupMemInfoRouter = require('./routes/group_mem_info');

var groupCalcMeetupRouter = require('./routes/group_calc_meetup');
var groupMemAddRouter = require('./routes/group_mem_add');
var emergencyRouter = require('./routes/emergency');
var reportRouter = require('./routes/report');

var logoutRouter = require('./routes/logout');


var app = express();

app.use(
  session({
      name: "DobbyIsFree",
      secret: "KYOSUNIM NA JOM GEU MAN BUL RU",
      resave: false,
      saveUninitialized: true,
      store: new FileStore(),
      cookie: { maxAge: 86400000 },
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 2차
app.use('/', introRouter);
app.use('/login', loginRouter);
app.use('/vacc_recommend',vaccRecommendRouter);
app.use('/reserve_search_hosp',reserveSearchHospRouter);
app.use('/reserve_select_date', reserveSelectDateRouter);
app.use('/side_effect_stat', sideEffectStatRouter);
app.use('/mypage', myPageRouter);
app.use('/modify_personal', modifyPersonalRouter);
app.use('/group_list', groupListRouter);
app.use('/group_mem_list', groupMemListRouter);
app.use('/group_mem_info', groupMemInfoRouter);
app.use('/reserve_confirm', reserveConfirmRouter);
app.use('/leftvacc_select', leftVaccSelectRouter);
app.use('/join', joinRouter);
app.use('/email_auth', emailAuthFinishRouter);
app.use('/vacc_stat', vaccStatRouter);
app.use('/group_calc_meetup', groupCalcMeetupRouter);
app.use('/group_mem_add', groupMemAddRouter);
app.use('/emergency', emergencyRouter);
app.use('/report', reportRouter);
app.use('/logout', logoutRouter);

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
