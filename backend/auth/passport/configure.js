module.exports = function (passport) {
    passport.serializeUser(async function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(async function (user, done) {
        done(null, user);
    });
};
