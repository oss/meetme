const service = require('./calendar-service');

export async function createCalendar(request, reply) {
    const { netid } = request.user;
    const calendar = await service.createCalendar(request.body, netid);
    return { 'calendar': calendar };
}

export async function deleteCalendar(request, reply) {
    const { netid } = request.user;
    const calendar = await service.deleteCalendar(calendarId, netid);
    reply.code(204);
}

export async function patchSettings(request, reply) {
    const { calendarId } = request.params;
    const { netid } = request.user;
    const calendar = await service.patchSettings(calendarId, request.body, netid);
    return { 'calendar': calendar };
}

export async function patchTimeblocks(request, response) {
    const { calendarId } = request.params;
    const { netid } = request.user;
    const calendar = await service.patchTimeblocks(calendarId, request.body, netid);
    return { 'calendar': calendar };
}

export async function getTimeblocks(req, res) {
    const { calendarId } = request.params;
    const { netid } = request.user;
    const blocks = await service.getTimeblocks(calendarId, netid);
    return { 'timeblocks': blocks };
}

export async function setOwner(req, res) {
    const { calendarId } = request.params;
    const { owner } = request.body;
    const { netid } = request.user;
    const cal = await service.setOwner(calendarId, owner, netid);
    return { 'calendar': calendar };
}

export async function shareCalendar(request, reply) {
    const { calendarId } = request.params;
    const { users } = request.body;
    const { netid } = request.user;
    const cal = await service.shareCalendar(calendar_id, users, netid);
    return { 'calendar': calendar };
}

export async function unshareCalendar(request, reply) {
    const { calendarId } = request.params;
    const { users } = request.body;
    const { netid } = request.user;
    const cal = await service.unshareCalendar(calendar_id, users, netid);
    return { 'calendar': calendar };
}

export async function joinCalendar(request, reply) {
    const { calendarId } = request.params;
    const { netid } = request.user;
    const cal = await service.joinCalendar(calendar_id, false, netid);
    return { 'calendar': calendar };
}

export async function joinCalendarViaSharelink(request, reply) {
    const { calendarId } = request.params;
    const { netid } = request.user;
    const cal = await service.joinCalendar(calendar_id, true, netid);
    return { 'calendar': calendar };
}

export async function leaveCalendar(request, reply) {
    const { calendarId } = request.params;
    const { netid } = request.user;
    const cal = await service.leaveCalendar(calendar_id, netid);
    return { 'calendar': calendar };
}
