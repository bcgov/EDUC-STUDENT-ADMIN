'use strict';

const config = require('./config/index');
const dotenv = require('dotenv');
const log = require('./components/logger');
const morgan = require('morgan');
const session = require('express-session');
const connectRedis = require('connect-redis');
const express = require('express');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const utils = require('./components/utils');
const auth = require('./components/auth');

dotenv.config();

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const OidcStrategy = require('passport-openidconnect-kc-idp').Strategy;

const apiRouter = express.Router();
const authRouter = require('./routes/auth');
const penRequestRouter = require('./routes/penRequest');
const penRequestBatchRouter = require('./routes/penRequestBatch');
const penMatchesRouter = require('./routes/penMatches');
const penRequestStatusesRouter = require('./routes/penRequestStatuses');
const studentDemographicsRouter = require('./routes/studentDemographics');
const studentsRouter = require('./routes/students');
const studentRequestRouter = require('./routes/studentRequest');
const studentRequestStatusesRouter = require('./routes/studentRequestStatuses');
const promMid = require('express-prometheus-middleware');
const actuator = require('express-actuator');
const messageSubscriber = require('./messaging/message-subscriber');
messageSubscriber.init();
messageSubscriber.callbacks();
//initialize app
const app = express();
const nocache = require('nocache');
app.set('trust proxy', 1);
//sets security measures (headers, etc)
app.use(cors());
app.use(helmet());
app.use(nocache());
const options = {
  basePath: '/api', // It will set /management/info instead of /info
  infoGitMode: 'simple', // the amount of git information you want to expose, 'simple' or 'full'
  customEndpoints: [] // array of extra endpoints
};
app.use(actuator(options));
app.use(promMid({
  metricsPath: '/api/prometheus',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5]
}));

//tells the app to use json as means of transporting data
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
const logStream = {
  write: (message) => {
    log.info(message);
  }
};
app.use(morgan(config.get('server:morganFormat'), { 'stream': logStream }));

const Redis = require('./util/redis/redis-client');
Redis.init(); // call the init to initialize appropriate client, and reuse it across the app.
const RedisStore = connectRedis(session);
const dbSession = new RedisStore({
  client: Redis.getRedisClient(),
  prefix: 'student-admin-sess:',
});
const cookie = {
  secure: true,
  httpOnly: true,
  maxAge: 1800000 //30 minutes in ms. this is same as session time. DO NOT MODIFY, IF MODIFIED, MAKE SURE SAME AS SESSION TIME OUT VALUE.
};
if (config.get('environment') !== undefined && config.get('environment') === 'local') {
  cookie.secure = false;
}
app.use(session({
  secret: config.get('oidc:clientSecret'),
  resave: false,
  saveUninitialized: true,
  cookie: cookie,
  store: dbSession
}));

//initialize routing and session. Cookies are now only reachable via requests (not js)
app.use(passport.initialize());
app.use(passport.session());

//initialize our authentication strategy
utils.getOidcDiscovery().then(discovery => {
  //OIDC Strategy is used for authorization
  passport.use('oidc', new OidcStrategy({
    issuer: discovery.issuer,
    authorizationURL: discovery.authorization_endpoint,
    tokenURL: discovery.token_endpoint,
    userInfoURL: discovery['userinfo_endpoint'],
    clientID: config.get('oidc:clientId'),
    clientSecret: config.get('oidc:clientSecret'),
    callbackURL: config.get('server:frontend') + '/api/auth/callback',
    scope: discovery.scopes_supported,
    kc_idp_hint: 'keycloak_bcdevexchange_idir'
  }, (_issuer, _sub, profile, accessToken, refreshToken, done) => {
    if ((typeof (accessToken) === 'undefined') || (accessToken === null) ||
      (typeof (refreshToken) === 'undefined') || (refreshToken === null)) {
      return done('No access token', null);
    }
    //Generate token for frontend validation
    //set access and refresh tokens
    profile.jwtFrontend = auth.generateUiToken();
    profile.jwt = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
  }));
  //JWT strategy is used for authorization
  passport.use('jwt', new JWTStrategy({
    algorithms: ['RS256'],
    // Keycloak 7.3.0 no longer automatically supplies matching client_id audience.
    // If audience checking is needed, check the following SO to update Keycloak first.
    // Ref: https://stackoverflow.com/a/53627747
    //audience: config.get('tokenGenerate:audience'),
    audience: config.get('server:frontend'),
    issuer: config.get('tokenGenerate:issuer'),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('tokenGenerate:publicKey')
  }, (jwtPayload, done) => {
    if ((typeof (jwtPayload) === 'undefined') || (jwtPayload === null)) {
      return done('No JWT token', null);
    }
    done(null, {
      jwt: jwtPayload,
      realmRole: jwtPayload['realm_role']
    });
  }));
}).catch((e) => {
  log.error(`discovery failed, ${e}`);
});
//functions to serialize/deserialize users
passport.serializeUser((user, next) => next(null, user));
passport.deserializeUser((obj, next) => next(null, obj));


//set up routing to auth and main API
app.use(/(\/api)?/, apiRouter);

apiRouter.use('/auth', authRouter);
apiRouter.use('/penRequest', penRequestRouter);
apiRouter.use('/penRequestBatch', penRequestBatchRouter);
apiRouter.use('/penMatches', penMatchesRouter);
apiRouter.use('/penRequest/codes', penRequestStatusesRouter);
apiRouter.use('/studentDemographics', studentDemographicsRouter);
apiRouter.use('/students', studentsRouter);
apiRouter.use('/studentRequest', studentRequestRouter);
apiRouter.use('/studentRequest/codes', studentRequestStatusesRouter);

// Prevent unhandled errors from crashing application
process.on('unhandledRejection', err => {
  log.error(err.stack);
});
// Prevent unhandled errors from crashing application
process.on('error', err => {
  log.error(err.stack);
});
module.exports = app;
