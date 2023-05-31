/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {Buffer} from 'buffer';
import { keccak256 } from 'js-sha3';
const secp256k1 = require('secp256k1');

export default {
	async fetch(request, env, ctx) {
		const user_id = env.user_id;
		const user_public_key = env.user_public_key;
		const api_url = env.api_url;
		const resourceId=env.resourceId;
		const biscuit=env.biscuit_INSTRUXI_IONI_AUDIT;
		const sqlText="select sum(audited_gold_amount) as total_reserve  from INSTRUXI.IONI_AUDIT where audited=true";
		// let response = await fetch (request, {cf:{cacheTtl: 5, cacheEverything:true}})
		// response = new Response(response)
		const privateKey = env.PRIVATE_KEY;
		const challenge = await requestChallenge(user_id,api_url);
		const signedChallenge = await signChallenge(challenge,privateKey);
		const token = await requestToken(user_id,challenge, signedChallenge,user_public_key,api_url);
		//query dql
		// return (new Response(JSON.stringify(token)));
		const tableData = await querySxT(token['accessToken'],resourceId,sqlText,biscuit,api_url);
		console.log(tableData);
		return (new Response(JSON.stringify(tableData['total_reserve'])));
	},
	
};

async function requestChallenge(user_id, api_url) {
	const url = api_url+"auth/code";
	console.log(url);
	const options = {
		method: 'POST',
		headers: { accept: '*/*', 'content-type': 'application/json' },
		body: JSON.stringify({userId: user_id})
		
	};
	const response = await fetch(url,options);
	const data = await response.json();
	return data["authCode"];
}

async function signChallenge(challenge, privateKey) {
	console.log("Challenge: ", challenge);
	let message = '\x19Ethereum Signed Message:\n' + challenge.length + challenge;
	console.log(message);
	const hashBuffer = keccak256(message);
	const hashHex = hashBuffer.toString('hex');
	console.log("Hash hex: :",hashHex);
	const keyBytes = Buffer.from(privateKey, 'hex');
	const hashBytes = Buffer.from(hashHex, 'hex');
	const signedObj = secp256k1.ecdsaSign(hashBytes, keyBytes);
	console.log(signedObj);
	const signatureBuffer = Buffer.concat([signedObj.signature, Buffer.from([signedObj.recid+27])]);
	const signatureHex = signatureBuffer.toString('hex');
	console.log("SignatureHex: ",signatureHex);
	return '0x'+signatureHex;
}




async function requestToken(user_id,authCode, signedAuthCode,user_public_key,api_url) {
	const url = api_url + "auth/token";
	const payload = {
		userId: user_id,
		authCode: authCode,
		signature: signedAuthCode,
		key: user_public_key,
		scheme: "1"
	};
	
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			accept: '*/*',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload)
	});
	const responseText = await response.json(); // Store the response text
	console.log("Access Token: ",responseText['accessToken']);
	return responseText;
}

async function querySxT(token,resourceId,sqlText,biscuit,api_url) {
	const url = api_url+"sql/dql";
	const payload = {resourceId: resourceId,sqlText:sqlText};
	const options = {
		method: 'POST',
		headers: { accept: '*/*', 'content-type': 'application/json',"authorization": "Bearer "+token, biscuit:biscuit },
		body: JSON.stringify(payload),
	};
	const response = await fetch(url, options);
	const data = await response.json();
	return data[0];
}

