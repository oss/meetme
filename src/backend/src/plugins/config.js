import fp from 'fastify-plugin'
import env from '@fastify/env'

// Configuration, access using fastify.config 
async function env(fastify, opts) {
    await fastify.register(env, {
	schema: S.object()
	    .prop('BACKEND_HOST', S.string().required())
	    .prop('COOKIE_SECRET', S.string().required())
	    .prop('CLIENT_SECRET', S.string().required())
	    .prop('CLIENT_ID', S.string().required())
	    .prop('OIDC_ISSUER', S.string().required())
	    .prop('MONGO_URL', S.string().required())
	    .valueOf()
    });
}

export default fp(env, { name: 'env' });
