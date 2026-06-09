const service = require('./user-service');
const { traceLogger, _baseLogger } = require('#logger');

// TODO: Need to implement for banned aliases so that it doesnt say true all of the time
function valid_alias(alias) {
    return true;
}

export async function setAlias(req, res) {
    const alias = req.body.alias;

    // Check for banned words
    traceLogger.verbose("validating alias...", req, { alias: alias });
    if (!valid_alias(new_alias)) {
        res.json({
            Status: 'error',
            error: 'invalid alias',
        });
        return;
    }
    try {
	let old_alias = service.setAlias(req, req.user.uid, alias);
	res.json({ Status: 'ok', old_alias: old_alias, new_alias: alias });
    }  catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getMe(req, res) {
    const id = req.user.uid;
    try {
	let user = service.getUser(req, id, true);
	res.json({ Status: 'ok', data: user });
    }  catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getUser(req, res) {
    const id = req.params.netid;
    try {
	let user = service.getUser(req, id, false);
	res.json({ Status: 'ok', data: user });
    }  catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}
