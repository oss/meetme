//authenticates requests
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    const new_time = Math.floor( Date.now() / (1000 * 10));
    console.log(new_time);
    console.log(req.session.time);
    console.log(new_time - req.session.time);
    if(new_time - req.session.time >= 2){
        console.log("if pass");
        req.session = null;
        res.json({
            Status: 'error',
            error: 'session expired'
        });
        return;
    }
    req.session.time = new_time;
    console.log('request is authenticated... continuing...');
    next();
  } else {
    req.session = null;
    res.json({
      Status: 'Error',
      Error: 'not logged in',
    });
    return;
  }
}

module.exports = { isAuthenticated };
