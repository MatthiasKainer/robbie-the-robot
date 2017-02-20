import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as  bodyParser from 'body-parser';


import { router as routes } from './routes/index';
import { router as users } from './routes/users';
import { router as api } from './routes/api';

export var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', api);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req:express.Request, res:express.Response, next:express.NextFunction) => {
  let err = new Error('Not Found');  
  (<any>err).status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err:any, req:express.Request, res:express.Response, next: express.NextFunction) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err:any, req:express.Request, res:express.Response, next: express.NextFunction) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});