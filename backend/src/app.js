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
const auth = require('./components/auth');
const bodyParser = require('body-parser');
const lusca = require('lusca');
const {rateLimit}  = require('express-rate-limit');
dotenv.config();

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const OidcStrategy = require('passport-openidconnect-keycloak-idp').Strategy;
require('./schedulers/student-admin-scheduler');
require('./schedulers/cache-service-scheduler');
require('./schedulers/doc-type-migration-scheduler');
const apiRouter = express.Router();
const authRouter = require('./routes/auth');
const configRouter = require('./routes/config');
const penRequestRouter = require('./routes/penRequest');
const penRequestBatchRouter = require('./routes/penRequestBatch');
const penMatchesRouter = require('./routes/penMatches');
const ministrySDCReportsRouter = require('./routes/ministrySDCReports');
const penRequestStatusesRouter = require('./routes/penRequestStatuses');
const studentDemographicsRouter = require('./routes/studentDemographics');
const sldRouter = require('./routes/sld');
const studentsRouter = require('./routes/students');
const studentRequestRouter = require('./routes/studentRequest');
const studentRequestStatusesRouter = require('./routes/studentRequestStatuses');
const penServicesRouter = require('./routes/pen-services-router');
const digitalIDRouter = require('./routes/digitalIdentity');
const penTraxRouter = require('./routes/penTrax');
const macroRouter = require('./routes/macro');
const analyticsRouter = require('./routes/analytics-router');
const nominalRollRouter = require('./routes/nominal-roll');
const edxRouter = require('./routes/edx-router');
const gradSchoolRouter = require('./routes/grad-school');
const instituteRouter = require('./routes/institute');
const sdcRouter = require('./routes/sdc');
const cacheRouter = require('./routes/cache-router');
const assessmentsRouter = require('./routes/assessments');
const gdcRouter = require('./routes/gdc');
const promMid = require('express-prometheus-middleware');
const Redis = require('./util/redis/redis-client');
Redis.init(); // call the init to initialize appropriate client, and reuse it across the app.
const messagePubSub = require('./messaging/message-pub-sub');
messagePubSub.init().then(() => {
  require('./messaging/handlers/saga-message-handler').subscribe();
  require('./messaging/handlers/institute-update-handler').subscribe();
  require('./messaging/handlers/jetstream-subscriber').subscribe();
  require('./messaging/handlers/institute-jetstream-subscriber').subscribe();
  require('./messaging/handlers/grad-school-update-handler').subscribe();
  require('./messaging/handlers/grad-school-jetstream-subscriber').subscribe();
  require('./messaging/handlers/edx-jetstream-subscriber').subscribe();
  require('./messaging/handlers/edx-event-handler').subscribe();
  require('./messaging/handlers/sdc-jetstream-subscriber').subscribe();
  require('./messaging/handlers/sdc-event-handler').subscribe();
}).catch((e) => log.error(e));
//initialize app
const app = express();
const nocache = require('nocache');
app.set('trust proxy', 1);
//sets security measures (headers, etc)
// NOSONAR
// app.use(cors());
app.use(helmet());
app.use(nocache());
app.use(promMid({
  metricsPath: '/api/prometheus',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5]
}));

//tells the app to use json as means of transporting data
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));
const logStream = {
  write: (message) => {
    log.info(message);
  }
};

if (config.get('rateLimit:enabled')) {
  const limiter = rateLimit({
    windowMs: config.get('rateLimit:windowInSec') * 1000,
    limit: config.get('rateLimit:limit'),
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
    skipSuccessfulRequests: false, // Do not count successful responses
    message: async () => {
      return `You can only make ${config.get('rateLimit:limit')} requests every ${config.get('rateLimit:windowMs')} seconds.`;
    }
  });
  app.use(limiter);
}

const RedisStore = connectRedis(session);
const dbSession = new RedisStore({
  client: Redis.getRedisClient(),
  prefix: 'student-admin-sess:',
});
const cookie = {
  secure: true,
  httpOnly: true,
  maxAge: config.get('server:session:maxAge') || 1800000 //30 minutes in ms. this is same as session time. DO NOT MODIFY, IF MODIFIED, MAKE SURE SAME AS SESSION TIME OUT VALUE.
};
if ('local' === config.get('environment')) {
  cookie.secure = false;
}
app.use(session({
  secret: config.get('oidc:clientSecret'),
  resave: false,
  saveUninitialized: true,
  cookie: cookie,
  store: dbSession
}));
app.use(lusca({
  csrf: {
    cookie: {name: '_csrf'}
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  nosniff: true,
  referrerPolicy: 'same-origin',
  xframe: 'SAMEORIGIN',
  xssProtection: true,
}));
app.use(require('./routes/health-check').router);
//initialize routing and session. Cookies are now only reachable via requests (not js)
app.use(passport.initialize());
app.use(passport.session());

//initialize our authentication strategy
auth.getOidcDiscovery().then(discovery => {
  //OIDC Strategy is used for authorization
  passport.use('oidc', new OidcStrategy({
    issuer: discovery.issuer,
    authorizationURL: discovery.authorization_endpoint,
    tokenURL: discovery.token_endpoint,
    userInfoURL: discovery['userinfo_endpoint'],
    clientID: config.get('oidc:clientId'),
    clientSecret: config.get('oidc:clientSecret'),
    callbackURL: config.get('server:frontend') + '/api/auth/callback',
    scope: 'openid profile',
    kc_idp_hint: config.get('server:idirIDPHint')
  }, (_issuer, profile, _context, idToken, accessToken, refreshToken, done) => {
    if ((typeof (accessToken) === 'undefined') || (accessToken === null) ||
      (typeof (refreshToken) === 'undefined') || (refreshToken === null)) {
      return done('No access token', null);
    }
    //Generate token for frontend validation
    //set access and refresh tokens
    profile.jwtFrontend = auth.generateUiToken();
    profile.jwt = accessToken;
    profile.idToken = idToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
  }));

  passport.use('oidcIDIRSilent', new OidcStrategy({
    issuer: discovery.issuer,
    authorizationURL: discovery.authorization_endpoint,
    tokenURL: discovery.token_endpoint,
    userInfoURL: discovery['userinfo_endpoint'],
    clientID: config.get('oidc:clientId'),
    clientSecret: config.get('oidc:clientSecret'),
    callbackURL: config.get('server:frontend') + '/api/auth/callback_idir_silent',
    scope: 'openid profile',
    kc_idp_hint: config.get('server:idirIDPHint')
  }, (_issuer, profile, _context, idToken, accessToken, refreshToken, done) => {
    if ((typeof (accessToken) === 'undefined') || (accessToken === null) ||
        (typeof (refreshToken) === 'undefined') || (refreshToken === null)) {
      return done('No access token', null);
    }
    //Generate token for frontend validation
    //set access and refresh tokens
    profile.jwtFrontend = auth.generateUiToken();
    profile.jwt = accessToken;
    profile.idToken = idToken;
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
    secretOrKey: config.get('tokenGenerate:publicKey'),
    ignoreExpiration: true
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

app.use(morgan(config.get('server:morganFormat'), {'stream': logStream}));
//set up routing to auth and main API
app.use(/(\/api)?/, apiRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/config', configRouter);
apiRouter.use('/penRequest', penRequestRouter);
apiRouter.use('/penRequestBatch', penRequestBatchRouter);
apiRouter.use('/penMatches', penMatchesRouter);
apiRouter.use('/ministrySDCReports', ministrySDCReportsRouter);
apiRouter.use('/penRequest/codes', penRequestStatusesRouter);
apiRouter.use('/studentDemographics', studentDemographicsRouter);
apiRouter.use('/sld', sldRouter);
apiRouter.use('/students', studentsRouter);
apiRouter.use('/studentRequest', studentRequestRouter);
apiRouter.use('/studentRequest/codes', studentRequestStatusesRouter);
apiRouter.use('/pen-services', penServicesRouter);
apiRouter.use('/digitalID', digitalIDRouter);
apiRouter.use('/penTrax', penTraxRouter);
apiRouter.use('/macros', macroRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/nominal-roll', nominalRollRouter);
apiRouter.use('/edx', edxRouter);
apiRouter.use('/institute', instituteRouter);
apiRouter.use('/sdc', sdcRouter);
apiRouter.use('/cache', cacheRouter);
apiRouter.use('/assessments', assessmentsRouter);
apiRouter.use('/gdc', gdcRouter);
apiRouter.use('/grad-school', gradSchoolRouter);
// Prevent unhandled errors from crashing application
process.on('unhandledRejection', err => {
  log.error(err.stack);
});
// Prevent unhandled errors from crashing application
process.on('error', err => {
  log.error(err.stack);
});
module.exports = app;
