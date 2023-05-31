/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Buffer }  from 'buffer';
import { keccak256 } from 'js-sha3';
import { ecdsaSign } from 'secp256k1';

const pattern = /favicon.ico/

export default {
	async fetch(request, env, ctx) {
		if (pattern.test(request.url)) {
			return (new Response(JSON.stringify({})));
		}
		const challenge = await requestChallenge(request, env);
		const token = await requestToken(env.USER_ID, challenge[0], challenge[1], env.PUBLIC_KEY, env.API_URL, env.AUTH_SCHEME);
		const tableData = await querySxT(token['accessToken'], env.RESOURCE_ID, env.SQL_TEXT, env.BISCUIT_INSTRUXI_IONI_AUDIT, env.API_URL);
		return (new Response(JSON.stringify({'total_reserve': tableData['total_reserve']})));
	},
	
};

async function requestChallenge(request, env) {
	const url = env.API_URL + "auth/code";
	const options = {
		method: 'POST',
		headers: { accept: '*/*', 'content-type': 'application/json' },
		body: JSON.stringify({userId: env.USER_ID})		
	};
	const cacheKey = new Request(request.url, request);
	let cache = caches.default;
	let response = await cache.match(cacheKey);
	if (!response) {
		//console.log('trying again after 5 seconds');
		//await new Promise(resolve => setTimeout(resolve, 5));
		const response = await fetch(url, options);
		if (response.status !== 200) {
			const data = await response.json()
			return (new Response(JSON.stringify({'error': data['detail']})));
		}
		const clonedResponse = response.clone();
		cache.put(cacheKey, clonedResponse, { cf: { cacheTtl: 60 } })
		//event.waitUntil(caches.default.put(cacheKey, clonedResponse, { cf: { cacheTtl: 60 } }));
		console.log(`cached incoming request with key ${request.url}`);
		const data = await response.json();
		const challenge = data['authCode']
		const signedChallenge = signChallenge(challenge, env.PRIVATE_KEY)
		return [challenge, signedChallenge];
	}
	console.log('cache found');
	const data = await response.json();
	const challenge = data['authCode']
	const signedChallenge = signChallenge(challenge, env.PRIVATE_KEY)
	return [challenge, signedChallenge];
}

function signChallenge(challenge, privateKey) {
	const message = '\x19Ethereum Signed Message:\n' + challenge.length + challenge;
	const hashBuffer = keccak256(message);
	const hashHex = hashBuffer.toString('hex');
	const keyBytes = Buffer.from(privateKey, 'hex');
	const hashBytes = Buffer.from(hashHex, 'hex');
	const signedObj = ecdsaSign(hashBytes, keyBytes);
	const signatureBuffer = Buffer.concat([signedObj.signature, Buffer.from([signedObj.recid+27])]);
	const signatureHex = signatureBuffer.toString('hex');
	return '0x'+signatureHex;
}

async function requestToken(userId, authCode, signedAuthCode, publicKey, apiUrl, scheme) {
	const url = apiUrl + "auth/token";
	const payload = {
		userId: userId,
		authCode: authCode,
		signature: signedAuthCode,
		key: publicKey,
		scheme: scheme
	};
	
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			accept: '*/*',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload)
	});
	const responseText = await response.json(); 
	return responseText;
}

async function querySxT(token, resourceId, sqlText, biscuit, apiUrl) {
	const url = apiUrl+"sql/dql";
	const payload = {resourceId: resourceId, sqlText:sqlText};
	const options = {
		method: 'POST',
		headers: {accept: '*/*', 'content-type': 'application/json', "authorization": "Bearer " + token, biscuit: biscuit},
		body: JSON.stringify(payload),
	};
	const response = await fetch(url, options);
	const data = await response.json();
	return data[0];
}

