const User_schema = require('../user/user_schema');
const {
    create_user_shib,
    update_last_login,
} = require('../user/helpers/modify_user');

const passport = require('passport');
const config = require("#config");
const express = require('express');
const router = express.Router();
const { traceLogger, _baseLogger } = require('#logger');

router.post('/login',
    async function (req, res, next) {
        console.log('-----------------------------');
        console.log('/Start login callback ');
        next();
    },
    passport.authenticate('samlStrategy', { failureRedirect: '/login' }),
    async function (req, res) {

        const user = await User_schema.findOne({ _id: req.user.uid });
        //create a new user account if user doesnt exist
        if (user === null) {
    	    traceLogger.verbose('creating new user', req, { uid: req.user.uid });
            const create_usr_resp = await create_user_shib(req.user);
            traceLogger.verbose('created new user', req, { uid: req.user.uid });
        }
        await update_last_login(req.user.uid);
        traceLogger.verbose('user login', req, { user: req.user.uid });
        req.session.time = Math.floor(Date.now() / config.auth.session.update_unit);
        res.redirect(config.frontend_domain + (req.body.RelayState || ''));
    }
);

router.get('/login', async function (req, res, next) {
    traceLogger.verbose('started login session', req);
    req.query.RelayState = req.query.dest;
    next();
},
passport.authenticate('samlStrategy')
);

module.exports = router;
/*

Sample req.user output:

{
    "issuer": "http://saml:8080/simplesaml/saml2/idp/metadata.php",
    "inResponseTo": "_9e4e271fff2b432120f1",
    "sessionIndex": "_13c26f3d49afc08c8880ac955a347702c211b112b0",
    "nameID": "_4a7713366fe5d1b489df4e4f256fadd62f424ee400",
    "nameIDFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
    "spNameQualifier": "saml-poc",
    "uid": "1",
    "eduPersonAffiliation": "group1",
    "email": "user1@example.com",
    "attributes":
    {
        "uid": "1",
        "eduPersonAffiliation": "group1",
        "email": "user1@example.com"
    }
}

*/
