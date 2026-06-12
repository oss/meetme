const S = require('fluent-json-schema')
const handler = require('./user-handler');
const Organization = require('./organization_schema');

const usersSchema = S.array().items(S.string().pattern('^[a-zA-Z0-9]+$')).minItems(1);

export default async function organization(fastify, opts) {
    const { authorize } = fastify;
    fastify.addHook('onRequest', authorize);

    fastify.route({
	method: 'POST',
	path: '/',
	schema: {
	    description: "Creates an organization with the given name",
	    body: S.object().prop('name', S.string()).required(),
	    response: { 201: S.object().prop('organization', Organization.schema()) }
	},
	handler: handler.createOrganization
    });

    fastify.route({
	method: 'GET',
	path: '/:organizationId',
	schema: {
	    description: "Gets an organization with the given id",
	    params: S.object().prop('organizationId', S.string()).required(),
	    response: { 200: S.object().prop('organization', Organization.schema()) }
	},
	handler: handler.getOrganization
    });

    fastify.route({
	method: 'DELETE',
	path: '/:organizationId',
	schema: {
	    description: "Deletes an organization with the given id",
	    params: S.object().prop('organizationId', S.string()).required(),
	    response: { 204: S.object() }
	},
	handler: handler.deleteOrganization
    });

    fastify.route({
	method: 'PATCH',
	path: '/:organizationId/leave',
	schema: {
	    description: "Leaves the organization as the logged in user",
	    params: S.object().prop('organizationId', S.string()).required(),
	    response: { 200: S.object().prop('organization', Organization.schema()) }
	},
	handler: handler.leaveOrganization
    });

    fastify.route({
	method: 'PATCH',
	path: '/:organizationId/share',
	schema: {
	    description: "Invites the given users to the given organization",
	    params: S.object().prop('organizationId', S.string()).required(),
	    body: S.object().prop('users', usersSchema).required(),
	    response: { 200: S.object().prop('organization', Organization.schema()) }
	},
	handler: handler.shareOrganization
    });

    fastify.route({
	method: 'PATCH',
	path: '/:organizationId/join',
	schema: {
	    description: "Declines the organization invite as the logged in user",
	    params: S.object().prop('organizationId', S.string()).required(),
	    response: { 200: S.object().prop('organization', Organization.schema()) }
	},
	handler: handler.joinOrganization
    });
}

