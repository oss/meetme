const S = require('fluent-json-schema')
const handler = require('./calendar-handler');
const Calendar = require('./calendar-schema');

import AppError from '#errors';

const userSchema = S.string().pattern('^[a-zA-Z0-9]+$');
const usersSchema = S.array().items(userSchema).minItems(1);
const ownerSchema = S.object()
    .prop('id', userSchema).required()
    .prop('isOrg', S.boolean()).required();

const timeblockSchema = S.object()
    .prop('start', S.number()).required()
    .prop('end', S.number()).required();

const settingsSchema = S.object()
    .prop('name', S.string())
    .prop('location', S.string())
    .prop('public', S.boolean())
    .prop('shareLink', S.boolean())
    .prop('description', S.string())
    .prop('meetingTime', timeblockSchema);

export default async function user(fastify, opts) {
    const { authorize } = fastify;
    fastify.addHook('onRequest', authorize);

    fastify.route({
	method: 'POST',
	path: '/',
	schema: {
	    description: "Creates a calendar with the given settings, owner defaults to logged in user",
	    body: S.object().prop("owner", ownerSchema).extend(settingsSchema)
		.prop("timeblocks", S.array().items(timeblockSchema)),
	    response: { 201: S.object().prop('calendar', Calendar.schema()) }
	},
	preHandler: validateTimeblocks,
	handler: handler.createCalendar
    });

    fastify.route({
	method: 'DELETE',
	path: '/:calendarId',
	schema: {
	    description: "Deletes the given calendar",
	    params: S.object().prop('calendarId', S.string()).required(),
	    response: { 204: S.object() }
	},
	handler: handler.deleteCalendar
    });

    fastify.route({
	method: 'PATCH',
	path: '/:calendarId/settings',
	schema: {
	    description: "Modifes a calendar with the given settings",
	    params: S.object().prop('calendarId', S.string()).required(),
	    body: S.object().prop().extend(settingsSchema),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	preHandler: validateSettings,
	handler: handler.patchSettings
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/timeblocks',
	schema: {
	    description: "Modifies timeblocks for the calendar",
	    params: S.object().prop('calendarId', S.string()).required(),
	    body: S.object()
		.prop('timeblocks', S.array().items(timeblockSchema).minItems(1)).required()
		.prop('operation', S.string().enum(['ADD', 'SUB', 'SET'])).required()
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	preHandler: validateTimeblocks,
	handler: handler.patchTimeblocks
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/share',
	schema: {
	    description: "Share the calendar with the given users",
	    params: S.object().prop('calendarId', S.string()).required(),
	    body: S.object().prop('users', usersSchema).required(),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	handler: handler.shareCalendar
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/unshare',
	schema: {
	    description: "Unshare the calendar with the given users",
	    params: S.object().prop('calendarId', S.string()).required(),
	    body: S.object().prop('users', usersSchema).required(),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	handler: handler.unshareCalendar
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/join',
	schema: {
	    description: "Join the calendar as the logged-in user",
	    params: S.object().prop('calendarId', S.string()).required(),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	handler: handler.joinCalendar
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/join',
	schema: {
	    description: "Join the calendar as the logged-in user via a sharelink",
	    params: S.object().prop('calendarId', S.string()).required(),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	handler: handler.joinCalendarViaSharelink
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/leave',
	schema: {
	    description: "Leave the calendar as the logged-in user",
	    params: S.object().prop('calendarId', S.string()).required(),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	handler: handler.leaveCalendar
    });

    fastify.route({
	method: 'PUT',
	path: '/:calendarId/owner',
	schema: {
	    description: "Transfers ownership to the given owner",
	    params: S.object().prop('calendarId', S.string()).required(),
	    body: S.object().prop("owner", ownerSchema),
	    response: { 200: S.object().prop('calendar', Calendar.schema()) }
	},
	handler: handler.setOwner
    });
}

async function validateTimeblocks(request, reply) {
    const { timeblocks } = request.body;
    if (timeblocks === undefined || timeblocks.length < 1) {
	return;
    }

    for (const block of timeblocks) {
	if (block.start >= block.end) {
	    throw new AppError.badRequest("Start block time is after end block time!");
	}
    }

    // Optimized version of checking for timeblock overlaps
    // By sorting first, overlapping ranges will be adjacent, therefore
    // we can just check the next time range for overlap
    const sorted = [ ...timeblocks].sort((a, b) => a.start - b.start);
    request.logger.info(`Validating timeblocks ${sorted.toString()}`);
    for (let i = 0; i < sorted.length - 1; ++i) {
	const curr = sorted[i];
	const next = sorted[i + 1];
	if (curr.start < next.end && next.start < curr.end) {
	    throw new AppError.badRequest(`Timeblocks ${JSON.stringify(curr)} overlaps with Timeblocks ${JSON.stringify(next)}`);
	}
    }
}

async function validateSettings(request, reply) {
    if (meeting_time.start > meeting_time.end) {
	throw new AppError.badRequest("Start block time is after end block time!");
    }

    if (!(await valid_name(new_name))) {
	throw new AppError.badRequest("Invalid name!");
    }
}

async function valid_name(potential_name) {
    return true;
}
