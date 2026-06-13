import * as service from "./calendar-service";

export async function createCalendar(request, _reply) {
  const { netid } = request.user;
  const calendar = await service.createCalendar(request.body, netid);
  return { calendar: calendar };
}

export async function deleteCalendar(request, reply) {
  const { netid } = request.user;
  await service.deleteCalendar(calendarId, netid);
  reply.code(204);
}

export async function patchSettings(request, _reply) {
  const { calendarId } = request.params;
  const { netid } = request.user;
  const calendar = await service.patchSettings(calendarId, request.body, netid);
  return { calendar: calendar };
}

export async function patchTimeblocks(request, _reply) {
  const { calendarId } = request.params;
  const { netid } = request.user;
  const calendar = await service.patchTimeblocks(calendarId, request.body, netid);
  return { calendar: calendar };
}

export async function getTimeblocks(request, _reply) {
  const { calendarId } = request.params;
  const { netid } = request.user;
  const blocks = await service.getTimeblocks(calendarId, netid);
  return { timeblocks: blocks };
}

export async function setOwner(request, _reply) {
  const { calendarId } = request.params;
  const { owner } = request.body;
  const { netid } = request.user;
  const calendar = await service.setOwner(calendarId, owner, netid);
  return { calendar: calendar };
}

export async function shareCalendar(request, _reply) {
  const { calendarId } = request.params;
  const { users } = request.body;
  const { netid } = request.user;
  const calendar = await service.shareCalendar(calendarId, users, netid);
  return { calendar: calendar };
}

export async function unshareCalendar(request, _reply) {
  const { calendarId } = request.params;
  const { users } = request.body;
  const { netid } = request.user;
  const calendar = await service.unshareCalendar(calendarId, users, netid);
  return { calendar: calendar };
}

export async function joinCalendar(request, _reply) {
  const { calendarId } = request.params;
  const { netid } = request.user;
  const calendar = await service.joinCalendar(calendarId, false, netid);
  return { calendar: calendar };
}

export async function joinCalendarViaSharelink(request, _reply) {
  const { calendarId } = request.params;
  const { netid } = request.user;
  const calendar = await service.joinCalendar(calendarId, true, netid);
  return { calendar: calendar };
}

export async function leaveCalendar(request, _reply) {
  const { calendarId } = request.params;
  const { netid } = request.user;
  const calendar = await service.leaveCalendar(calendarId, netid);
  return { calendar: calendar };
}
