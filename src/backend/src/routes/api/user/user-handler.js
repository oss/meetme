import * as service from "./user-service.js";

export async function setAlias(request, _reply) {
  const { alias } = request.body;
  const { netid } = request.user;
  return service.setAlias(netid, alias);
}

export async function getMe(request, _reply) {
  const { netid } = request.user;
  return service.getUser(netid, true);
}

export async function getUser(request, _reply) {
  const { netid } = request.params;
  return service.getUser(netid, false);
}
