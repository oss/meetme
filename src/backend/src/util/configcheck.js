const config = require('#config');
const json5 = require('json5');

require('json5/lib/register');
const defaultconfig = require('../defaults/config.json5')

// Allows accessing values in the config object using a path string
function getConfigValues(path) {
    let cval = config;
    let dval = defaultconfig;
    for (let component of path.split('.')) {
	cval = cval[component];
	dval = dval[component];
    }

    return [cval, dval];
}

// Checks if the config key has the same value as val. If so, log a message
// telling the user to change and returns false.
function checkValue(path) {
    const [cval, dval] = getConfigValues(path);
    if (cval === dval) {
	console.log(path + ' is still using development value, please change it!');
	return false;
    }
    return true;
}

// Checks if the file has the same value as the default
function checkFile(path) {
    const [cval, dval] = getConfigValues(path);

    let filebuf = Buffer.from(cval);
    let dfilebuf = Buffer.from(dval);

    if (filebuf.equals(dfilebuf)) {
	console.log(path + ' has the same content as the default, please change it!');
	return false;
    }
    return true;
}

// Validates if the provided configuration file is valid
function checkConfig() {
    let valid = true;

    valid &= checkValue('frontend_domain');
    valid &= checkValue('backend_domain');
    valid &= checkValue('ldap.password_file');

    valid &= checkValue('auth.cookie_domain');
    valid &= checkValue('auth.issuer');
    valid &= checkValue('auth.login_url');

    valid &= checkFile('auth.idp_cert');
    valid &= checkFile('auth.shib_key.private');
    valid &= checkFile('auth.shib_key.public');

    valid &= checkFile('ldap.password_file');
    valid &= checkFile('keygrip_path');

    return valid;
}

module.exports = { checkConfig }
