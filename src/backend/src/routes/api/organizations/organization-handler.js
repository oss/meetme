const service = require("./organization-service");

export async function createOrganization(request, reply) {
  const { name } = request.body;
  const { netid } = request.user;
  reply.code(201);
  return await service.createOrganization(name, netid);
}

export async function getOrganization(request, _reply) {
  const { orgid } = request.params;
  const { netid } = request.user;
  const { org, _role } = await service.getOrganization(orgid, netid, false);
  return { organization: org };
}

export async function deleteOrganization(request, reply) {
  const { orgid } = request.params;
  const { netid } = request.user;
  await service.deleteOrganization(orgid, netid);
  reply.code(204);
}

export async function leaveOrganization(request, _reply) {
  const { orgid } = request.params;
  const { netid } = request.user;
  const org = await service.leaveOrganization(orgid, netid);
  return { organization: org };
}

export async function shareOrganization(request, _reply) {
  const { orgid } = request.params;
  const { users } = request.body;
  const { netid } = request.user;
  const org = await service.shareOrganization(orgid, netid, users);
  return { organization: org };
}

export async function joinOrganization(request, _reply) {
  const { orgid } = request.params;
  const org = await service.joinOrganization(orgid, netid);
  return { organization: org };
}
