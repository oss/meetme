import fp from 'fastify-plugin'
import OAuth from '@fastify/oauth2'
import Cookie from '@fastify/cookie'
// import Csrf from '@fastify/csrf-protection'

import AppError from '#errors';

async function auth(fastify, _opts) {
    const { config } = fastify;

    await fastify.register(Cookie, {
	secret: config.COOKIE_SECRET
    });

    // await fastify.register(Csrf, {
    // 	sessionPlugin: '@fastify/cookie',
    // 	cookieOpts: { signed: true }
    // });

    await fastify.register(OAuth, {
	name: 'cas',
	credentials: {
	    scope: ['profile', 'email', 'eduPerson'],
	    client: {
		id: config.CLIENT_ID,
		secret: config.CLIENT_SECRET,
	    },
	},
	startRedirectPath: '/api/auth/login/',
	// TODO: change this in prod
	callbackUri: 'http://localhost:3000/api/auth/login/callback',
	discovery: { issuer: config.OIDC_ISSUER }
    });

    fastify.decorate('authorize', authorize);
    fastify.decorateRequest('user', null);

    async function authorize(request, _reply) {
	const { session } = request.cookies;
	if (!session) {
	    throw AppError.unauthorized("Missing session cookie");
	}

	const cookie = request.unsignCookie(session);
	if (!cookie.valid) {
	    throw AppError.unauthorized("Invalid cookie signature");
	}

	const data = await this.cas.userinfo(cookie.token);
	if (!data) {
	    throw AppError.unauthorized("Could not authenticate user");
	}
	request.user = { data };
    }
}

export default fp(auth, { name: 'auth' });
