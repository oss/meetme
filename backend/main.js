// server.js File
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
mongoose.connect(process.env.MONGO_URL);
const random_ip_list = require("./random_ip_list.json");

app.set('trust proxy', 1);
router.use((req, res, next) => {
  //console.log('backend: %s %s %s', req.method, req.url, req.path);
  req.request_id = crypto.randomUUID();
  logger.info('request received',req,{ip: req.headers['x-forwarded-for']});
  //logger.info('request received',req,{ip: random_ip_list[Math.floor(Math.random()* random_ip_list.length)]});
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
    keys: ['secret1',"secret2"],
    resave: true,
    saveUninitialized: false,
    domain: 'localhost.edu',
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
    callbackUrl: 'https://api.localhost.edu/login',
    entryPoint: process.env.LOGIN_URL,
    issuer: 'https://api.localhost.edu/shibboleth',
    identifierFormat: null,
    decryptionPvk: fs.readFileSync('./certs/key.pem', 'utf8'),
    privateCert: fs.readFileSync('./certs/cert.pem', 'utf8'),
    idpCert: fs.readFileSync('./certs/idp.pem', 'utf8'),
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

//set up paths
const router_config = require('./router_config.json');
for (let i = 0; i < router_config.length; i++) {
  let dir = router_config[i]['dir'];
  let top_endpoint = router_config[i]['route'];
  let files = fs.readdirSync(dir);

  for (let j = 0; j < files.length; j++) {
    if (!files[j].includes('schema') && files[j].endsWith('.js')) {
      console.log('loading file ---> ' + files[j]);
      router.use(top_endpoint, require('./' + dir + '/' + files[j]));
    }
  }

  if (process.env.DEV === 'true') {
    if (fs.existsSync('./' + dir + '/testing')) {
      const testing_files = fs.readdirSync('./' + dir + '/testing');
      for (let j = 0; j < testing_files.length; j++) {
        console.log('loading test file ---> ' + testing_files[j]);
        router.use(
          '/test',
          require('./' + dir + '/testing/' + testing_files[j])
        );
      }
    }
  }
}

router.get('/', function (req, res) {
    let routes=[]
    function print (path, layer) {
        if (layer.route) {
            layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
        } else if (layer.name === 'router' && layer.handle.stack) {
            layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
        } else if (layer.method) {
            routes.push(layer.method.toUpperCase()+" /"+path.concat(split(layer.regexp)).filter(Boolean).join('/'))
        }
    }
      
    function split (thing) {
        if (typeof thing === 'string') {
            return thing.split('/')
        } else if (thing.fast_slash) {
            return ''
        } else {
            var match = thing.toString()
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '$')
            .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
            return match
            ? match[1].replace(/\\(.)/g, '$1').split('/')
            : '<complex:' + thing.toString() + '>'
        }
    }
    
    if(process.env.DEV === 'true'){
        app._router.stack.forEach(print.bind(null, []))

        res.json({
            Status: 'ok',
            build_time: new Date(),
            git_branch: process.env.GIT_BRANCH,
            git_hash: process.env.GIT_HASH,
            build: 'dev',
            paths: [...new Set(routes)]
        });    
    } 
    else {
        res.json({
            Status: 'ok',
            build: 'prod',
            git_branch: process.env.GIT_BRANCH,
            git_hash: process.env.GIT_HASH
        });
    }
});

app.use('/', router);

// Starting server using listen function
app.listen(port, function (err) {
  if (err) {
    console.log('Error while starting server');
  } else {
    console.log('Server has been started at ' + port);
  }
});
