import { readFileSync } from 'fs'
import path from 'node:path'

const { version } = JSON.parse(readFileSync(path.join(import.meta.url, '../package.json')))

export default async function status(fastify, opts) {
    fastify.route({
	method: 'GET',
	path: '/status',
	schema: {
	    description: 'Returns status and version',
	    response: {
		200: S.object().prop('status', S.string()).prop('version', S.string())
	    }
	},
	handler: onStatus,
    });

    async function onStatus (request, reply) {
	return { status: 'ok', version: version };
    }
}
