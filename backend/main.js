// json5 stuff to load config. Use json5 so we can have comments in json
const express = require('express'); // Importing express module
const fs = require('fs');
const app = express(); // Creating an express object
const router = express.Router();
const port = 8000; // Setting an port for this application
const passport = require('passport');
const cookieSession = require('cookie-session');
const saml = require('@node-saml/passport-saml');
const mongoose = require('mongoose');
const logger = require('./logging');
const crypto =  require("crypto");
const Keygrip = require("keygrip");
const random_ip_list = require("./random_ip_list.json");
const config = require('#config');
const build = require('#build');
mongoose.connect(config.mongo_url);

app.set('trust proxy', 1);
router.use((req, res, next) => {
  //console.log('backend: %s %s %s', req.method, req.url, req.path);
  req.request_id = crypto.randomUUID();
  //logger.info('request received',req,{ip: req.headers['x-forwarded-for']});
  logger.info('request received',req,{ip: random_ip_list[Math.floor(Math.random()* random_ip_list.length)]});
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((error, req, res, next) => {
  if (error !== null) {
    console.log(error.body);
    res.json({
      Status: 'error',
      error: 'error parsing body',
      trace: error,
    });
    return;
  } else next();
});

app.use(
  cookieSession({
    keys: new Keygrip(require(config.auth.keygrip_secret_file),'sha512'),
    resave: true,
    saveUninitialized: false,
    domain: config.auth.cookie_domain,
  })
);

/*
    need to implement a "nothing" request.session.regenerate and request.session.save
    see the following links for details:
        https://github.com/jaredhanson/passport/issues/904
        https://github.com/expressjs/cookie-session/issues/166
*/
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})

//inside unsecure bc we use nginx magic
const samlStrategy = new saml.Strategy(
  {
    callbackUrl: `${config.backend_domain}/login`,
    entryPoint: config.auth.login_url,
    issuer: config.auth.issuer,
    identifierFormat: null,
    decryptionPvk: fs.readFileSync(config.auth.shib_key.private, 'utf8'),
    privateCert: fs.readFileSync(config.auth.shib_key.public, 'utf8'),
    idpCert: fs.readFileSync(config.auth.idp_cert, 'utf8'),
//    validateInResponseTo: false,
    disableRequestedAuthnContext: true,
    wantAssertionsSigned: false
  },
  function (profile, done) {
        console.log("main_js_saml",profile);
        const user_serialized = {}

        user_serialized.uid = profile.attributes['urn:oid:0.9.2342.19200300.100.1.1'];
        user_serialized.firstName = profile.attributes['urn:oid:2.5.4.42'];
        user_serialized.lastName = profile.attributes['urn:oid:2.5.4.4'];
        return done(null, user_serialized);
    }
);
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passport/configure')(passport);
passport.use('samlStrategy', samlStrategy);

const enabled_routes = config['routers']
for (let i = 0; i < enabled_routes.length; i++) {
    const enabled_route = enabled_routes[i];

    const prefix = enabled_route['prefix'];
    const router_location = enabled_route['router_file'];
    const router_obj = require(router_location)
    router.use(prefix, router_obj);
    router_obj.router_prefix = prefix;
    if(prefix === '/')
        router_obj.router_prefix = prefix.substring(1);
}

const routes = [];

router.get('/', function (req, res) {
    res.json({
        Status: 'ok',
        time: new Date(),
        git_branch: process.env.GIT_BRANCH,
        git_hash: process.env.GIT_HASH,
        paths: routes
    });
});

app.use('/', router);
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({"error": "TODO: make better error logs"})
})


function printRegisteredRoutes(routerStack, parentPath) {
    console.log('routerstack',routerStack)
    routerStack.forEach((middleware) => {
        if (middleware.route) {
            routes.push(
                `${middleware.route.stack[0].method.toUpperCase()} ${parentPath}${middleware.route.path}`
            );
        } else if (middleware.name === 'router') {
            console.log(middleware.handle.router_prefix)
            printRegisteredRoutes(middleware.handle.stack,`${parentPath}${middleware.handle.router_prefix || ''}`);
        }
    });
}

printRegisteredRoutes(app.router.stack,'');

// Starting server using listen function
app.listen(port, function (err) {
  if (err) {
    console.log('Error while starting server');
  } else {
    console.log('Server has been started at ' + port);
  }
});
