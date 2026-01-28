// json5 stuff to load config. Use json5 so we can have comments in json
const express = require('express'); // Importing express module
const fs = require('fs');
const passport = require('passport');
const cookieSession = require('cookie-session');
const saml = require('@node-saml/passport-saml');
const mongoose = require('mongoose');
const { traceLogger, _baseLogger } = require('#logger');
const crypto =  require("crypto");
const Keygrip = require("keygrip");
const process = require('process');
const random_ip_list = require("./random_ip_list.json");
const config = require('#config');
const { typeCheck, netidCheck } = require("#util/assert");
const configcheck = require("#util/configcheck");

// Check if config is valid before starting anything
// See: https://nodejs.org/api/process.html#processexitcode
if (process.env.PROD === "true" && !configcheck()) {
    process.exitCode = 1;
    throw new Error("Invalid config file");
}

const app = express();
const router = express.Router();
const port = 8000;

mongoose.connect(config.mongo_url);
mongoose.set("transactionAsyncLocalStorage", true);

app.set('trust proxy', 1);
app.use((req, res, next) => {
    // console.log('backend: %s %s %s', req.method, req.url, req.path);
    //logger.info('request received',req,{ip: req.headers['x-forwarded-for']});
    const start_time = new Date().valueOf();
    res.on('finish', function() {

        const now = new Date().valueOf();
        _baseLogger.log({
            message: `status: ${res.statusCode} @ ${req.url} in ${now - start_time} ms`,
            level: res.statusCode === 500 ? 'error' : 'info',
            duration: now-start_time,
            url: req.url,
            route: req.baseUrl + ( req.route ? req.route.path : req.path ),
            ip: req.headers['x-real-ip'],
            //ip: random_ip_list[Math.floor(Math.random()* random_ip_list.length)],
            request_id: req.headers['x-request-id'],
            user_agent: req.headers['user-agent'],
            response_code: res.statusCode,
            container_id: process.env.HOSTNAME,
            request_method: req.method,
            netid: req.isAuthenticated() ? req.user.uid : null,
            version: process.env.GIT_HASH,
            bytesIn: req.socket.bytesRead,
            bytesOut: req.socket.bytesWritten
            // latitude -> added by fluent-bit
            // longitude -> added by fluent-bit
        });
    });
    //logger.info('request received',req,{path: req.url,ip: random_ip_list[Math.floor(Math.random()* random_ip_list.length)], user_agent: req.headers['user-agent']});
    next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((error, req, res, next) => {
    if (error !== null) {
        res.status(400).json({
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
            cb();
        };
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb();
        };
    }
    next();
});

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
    async function (profile, done) {
        const user_serialized = {};

        // netid
        user_serialized.uid = profile.attributes['urn:oid:0.9.2342.19200300.100.1.1'];
        typeCheck.assert(user_serialized.uid,typeCheck.validPrimitives.string);
        await netidCheck.assertAtLevel(user_serialized.uid,netidCheck.scope.string);

        //firstName
        user_serialized.firstName = profile.attributes['urn:oid:2.5.4.42'];
        typeCheck.assert(user_serialized.firstName,typeCheck.validPrimitives.string);

        //lastName
        user_serialized.lastName = profile.attributes['urn:oid:2.5.4.4'];
        typeCheck.assert(user_serialized.lastName,typeCheck.validPrimitives.string);

        return done(null, user_serialized);
    }
);
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passport/configure')(passport);
passport.use('samlStrategy', samlStrategy);

app.use(async function(req,res,next){
    // this makes it so that we don't send an empty invalid session and session.sig on non-authenticated requests
    // exlcude the unauthed login endpoint
    if(!req.isAuthenticated() && !(req.url === '/login' && req.method === 'POST'))
        req.session = {};

    next();
});

const enabled_routes = config['routers'];
for (let i = 0; i < enabled_routes.length; i++) {
    const enabled_route = enabled_routes[i];

    const prefix = enabled_route['prefix'];
    const router_location = enabled_route['router_file'];
    const router_obj = require(router_location);
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
        build: {
	    branch: process.env.GIT_BRANCH,
	    hash: process.env.GIT_HASH,
        },
        paths: routes
    });
});

app.use('/', router);

app.use((req, res) => {
    //logger.info('')
    res.status(404).json({status: 'error', error: 'invalid path'});
});

app.use((err, req, res, next) => {
    traceLogger.verbose('uncaught error encountered',req,{error_message: err.message, error_stack: err.stack});
    res.status(500).json({"error": "An unexpected error occured. Please email oss@oit.rutgers.edu along with the request id for help.", message: err.message,request_id: req.headers['x-request-id']});
});


function printRegisteredRoutes(routerStack, parentPath) {
    routerStack.forEach((middleware) => {
        if (middleware.route) {
	    const method = middleware.route.stack[0].method.toUpperCase();
	    const path = `${parentPath}${middleware.route.path}`;
            routes.push({ method: method, path: path });
	    console.log("Loaded router: " + method + " at " + path);
        } else if (middleware.name === 'router') {
            printRegisteredRoutes(middleware.handle.stack,`${parentPath}${middleware.handle.router_prefix || ''}`);
        }
    });
}

printRegisteredRoutes(app.router.stack,'');

// Starting server using listen function
app.listen(port, function (err) {
    if (err) {
        console.log("Error while starting server: " + err.message);
    } else {
        console.log("Server has been started at " + port);
    }
});

// Shutdown
process.on('SIGTERM', () => {
    console.log("Received sigterm, terminating...");
    app.close(() => {
        console.log("Server has been closed");
    })
})
