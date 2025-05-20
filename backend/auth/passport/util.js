//authenticates requests
const config = require("#config");
const { traceLogger } = require('#logger')

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        const new_time = Math.floor( Date.now() / config.auth.session.update_unit );
        if(new_time - req.session.time >= config.auth.session.expiration){

            traceLogger.verbose('session expired',req)

            req.session = null;
            res.json({
                Status: 'error',
                error: 'session expired'
            });
            return;
        }
        traceLogger.verbose('session successfully authenticated',req)
        if(new_time - req.session.time >= config.auth.session.update_interval)
            req.session.time = new_time;

        next();
    } else {
        traceLogger.verbose('invalid or missing credential',req)
        res.status(401).json({
            Status: 'error',
            error: 'Invalid or Missing Credentials',
        });
        return;
    }
}

module.exports = { isAuthenticated };
