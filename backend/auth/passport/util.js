//authenticates requests
const config = require("#config");

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        const new_time = Math.floor( Date.now() / config.auth.session.update_unit );
        if(new_time - req.session.time >= config.auth.session.expiration){
            req.session = null;
            res.json({
                Status: 'error',
                error: 'session expired'
            });
            return;
        }
        if(new_time - req.session.time >= config.auth.session.update_interval)
            req.session.time = new_time;
        next();
    } else {
        res.status(401).json({
            Status: 'error',
            error: 'Invalid or Missing Credentials',
        });
        return;
    }
}

module.exports = { isAuthenticated };
