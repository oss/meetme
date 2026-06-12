const { createHash } = require('crypto');

export function createId(userid) {
    return createHash('sha512')
	.update(new Date().getTime().toString() + userid + Math.random())
	.digest('base64url');
}

export function difference(arr1, arr2) {
    return [...((new Set(arr1)).diff(new Set(arr2)))];
}
