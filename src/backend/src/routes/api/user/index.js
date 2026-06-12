const S = require('fluent-json-schema')
const handler = require('./user-handler');
const User = require('./user-schema');

export default async function user(fastify, opts) {
    const { authorize } = fastify;
    fastify.addHook('onRequest', authorize);

    // TODO: validat alias
    fastify.route({
	method: 'PATCH',
	path: '/alias',
	schema: {
	    description: "Modifies the alias of the logged in user",
	    body: S.object().prop('alias', S.string()),
	    response: { 200: S.object().prop('user', User.schema()) }
	},
	handler: handler.setAlias
    });

    fastify.route({
	method: 'GET',
	path: '/me',
	schema: {
	    description: "Gets user data of logged in user",
	    response: { 200: S.object().prop('user', User.schema()) }
	},
	handler: handler.getMe
    });

    fastify.route({
	method: 'GET',
	path: '/:netid',
	schema: {
	    description: "Gets user data of the user with the given netid",
	    params: S.object().prop('netid', S.string()),
	    response: { 200: S.object().prop('user', User.schema()) }
	},
	handler: handler.getUser
    });
}
