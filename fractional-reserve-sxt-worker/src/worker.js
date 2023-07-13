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
import {keccak256} from 'js-sha3';
import {ecdsaSign} from 'secp256k1';

const pattern = /favicon.ico/

export default {
    async fetch(request, env, ctx) {
        console.log(ctx);
        // Ignore browser favicon requests
        if (pattern.test(request.url)) {
            return (new Response(''));
        }

        const {searchParams} = new URL(request.url)
        let tokenId = searchParams.get('tokenId')
        let query = `${env.SQL_TEXT}  and claim_id = ${tokenId}`
        if (!tokenId) {
            query = env.TOTAL_RESERVE_QUERY
        }

        const challenge = await requestChallenge(request, env);
        const token = await requestToken(env.USER_ID, challenge[0], challenge[1], env.PUBLIC_KEY, env.API_URL, env.AUTH_SCHEME);
        const tableData = await querySxT(token['accessToken'], env.RESOURCE_ID, query, env.BISCUIT_INSTRUXI_IONI_AUDIT, env.API_URL);
        return (new Response(responseBuilder(tableData, tokenId)));
    },
};

const responseBuilder = (response, token) => {

    if (token) {
        return JSON.stringify(response);
    }
    return JSON.stringify({
        data: {
            TOTAL_RESERVE: response[0].total_reserve
        }
    })

}

async function requestChallenge(request, env) {
    const url = env.API_URL + "auth/code";
    const options = {
        method: 'POST',
        headers: {accept: '*/*', 'content-type': 'application/json'},
        body: JSON.stringify({userId: env.USER_ID})
    };
    const response = await fetch(url, options);
    if (response.status !== 200) {
        const data = await response.json()
        return (new Response(JSON.stringify({'error': data['detail']})));
    }
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
    const signatureBuffer = Buffer.concat([signedObj.signature, Buffer.from([signedObj.recid + 27])]);
    const signatureHex = signatureBuffer.toString('hex');
    return '0x' + signatureHex;
}

const requestToken = async function (userId, authCode, signedAuthCode, publicKey, apiUrl, scheme) {
    const url = apiUrl + "auth/token";
    const payload = {
        userId: userId,
        authCode: authCode,
        signature: signedAuthCode,
        key: publicKey,
        scheme: scheme
    };
    const response = await jsonHttpClient(url, {method: 'POST'}, payload)
    const responseText = await response.json();
    return responseText;
}

const querySxT = async function (token, resourceId, sqlText, biscuit, apiUrl) {
    const url = apiUrl + "sql/dql";
    const payload = {resourceId: resourceId, sqlText: sqlText};
    const response = await jsonHttpClient(url, {
        method: 'POST',
        "authorization": "Bearer " + token,
        biscuit: biscuit
    }, payload);
    const data = await response.json();
    return data;
}


const jsonHttpClient = async function (url, headers, body) {
    return fetch(url, {
        method: headers.method,
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body)
    })
}