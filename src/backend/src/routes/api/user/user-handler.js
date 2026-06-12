const service = require('./user-service');

// TODO: Handle this into input validation
function valid_alias(alias) {
    return true;
}

export async function setAlias(request, reply) {
    const { alias } = request.body;
    const { netid } = request.user;
    return service.setAlias(netid, alias);
}

export async function getMe(request, reply) {
    const { netid } = request.user;
    return service.getUser(netid, true);
}

export async function getUser(request, reply) {
    const { netid } = request.params;
    return service.getUser(netid, false);
}
