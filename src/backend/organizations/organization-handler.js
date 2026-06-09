const service = require('./organization-service');

export async function getMemberlist(req, res) {
    const org_id = req.params.organization_id;
    try {
	const org = await service.getOrg(org_id, req.user.id, req);
	res.json({ Status: 'ok', memberlist: org });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function createOrganization(req, res) {
    if (req.body === undefined) {
        res.json({ Status: 'error', error: 'Missing body' });
        return;
    }
    try {
	const org = await service.createOrganization(req.body.name, req.user.id, req);
	res.json({ Status: 'ok', organization: org });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getOrganization(req, res) {
    const org_id = req.params.organization_id;
    try {
	const org = await service.getOrg(org_id, req.user.id, req);
	res.json({ Status: 'ok', organization: org });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function deleteOrganization(req, res) {
    const org_id = req.params.organization_id;
    try {
	const org = await service.deleteOrganization(org_id, req.user.id, req);
	res.json({ Status: 'ok', org: org });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function leaveOrganization(req, res) {
    const org_id = req.params.organization_id;
    try {
	const org = await service.leaveOrganization(org_id, req.user.id, req);
	res.json({ Status: 'ok' });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function shareOrganization(req, res) {
    const org_id = req.params.organization_id;
    const new_users = req.body.new_users;

    traceLogger.verbose("validating parameters...", req, { new_users: new_users });
    if (new_users === undefined) {
        res.json({ Status: 'error', error: 'missing new_users body' });
        return;
    }

    if (!new_users.toString().match('(?:[a-zA-Z0-9]+,?)+')) {
        res.json({ Status: 'error', error: 'Incorrect new users payload' });
        return;
    }

    if (new_users.length === 0) {
        res.json({ Status: 'error', error: 'New users body is empty' });
        return;
    }

    try {
	const payload = await service.shareOrganization(org_id, users, req.user.id, req);
	res.json({ Status: 'ok', user_list: payload });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function declineOrganizationInvite(req, res) {
    const org_id = req.params.organization_id;
    try {
	const id = await service.declineOrganizationInvite(org_id, req.user.id, req);
	res.json({ Status: 'ok', org: id });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function acceptOrganizationInvite(req, res) {
    const org_id = req.params.organization_id;
    try {
	const id = await service.acceptOrganizationInvite(org_id, req.user.id, req);
	res.json({ Status: 'ok', org: id });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}
