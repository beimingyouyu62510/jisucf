// @ts-ignore
import { connect } from 'cloudflare:sockets';

// How to generate your own UUID:
// [Windows] Press "Win + R", input cmd and run:  Powershell -NoExit -Command "[guid]::NewGuid()"
let userID = 'aad22fad-78c6-4c5d-8315-85e540434b47';

const พร็อกซีไอพีs = ['us02.cf01.us.kg'];

// if you want to use ipv6 or single พร็อกซีไอพี, please add comment at this line and remove comment at the next line
let พร็อกซีไอพี = พร็อกซีไอพีs[Math.floor(Math.random() * พร็อกซีไอพีs.length)];
// use single พร็อกซีไอพี instead of random
// let พร็อกซีไอพี = 'cdn.xn--b6gac.eu.org';
// ipv6 พร็อกซีไอพี example remove comment to use
// let พร็อกซีไอพี = "[2a01:4f8:c2c:123f:64:5:6810:c55a]"

let dohURL = 'https://sky.rethinkdns.com/1:-Pf_____9_8A_AMAIgE8kMABVDDmKOHTAKg='; // https://cloudflare-dns.com/dns-query or https://dns.google/dns-query

let 优选IP = 'yx.cf02.us.kg'; // 替换为你的优选IP地址

if (!isValidUUID(userID)) {
    throw new Error('uuid is invalid');
}

export default {
    /**
     * @param {import("@cloudflare/workers-types").Request} request
     * @param {{UUID: string, PROXYIP: string, DNS_RESOLVER_URL: string, NODE_ID: int, API_HOST: string, API_TOKEN: string}} env
     * @param {import("@cloudflare/workers-types").ExecutionContext} ctx
     * @returns {Promise<Response>}
     */
    async fetch(request, env, ctx) {
        // uuid_validator(request);
        try {
            userID = env.UUID || userID;
            พร็อกซีไอพี = env.PROXYIP || พร็อกซีไอพี;
            dohURL = env.DNS_RESOLVER_URL || dohURL;
            优选IP = env.PREFERRED_IP || 优选IP; // 从环境变量获取优选IP
            let userID_Path = userID;
            if (userID.includes(',')) {
                userID_Path = userID.split(',')[0];
            }
            const upgradeHeader = request.headers.get('Upgrade');
            if (!upgradeHeader || upgradeHeader !== 'websocket') {
                const url = new URL(request.url);
                switch (url.pathname) {
                    case `/cf`: {
                        return new Response(JSON.stringify(request.cf, null, 4), {
                            status: 200,
                            headers: {
                                "Content-Type": "application/json;charset=utf-8",
                            },
                        });
                    }
                    case `/${userID_Path}`: {
                        const วเลสConfig = getวเลสConfig(userID, request.headers.get('Host'));
                        return new Response(`${วเลสConfig}`, {
                            status: 200,
                            headers: {
                                "Content-Type": "text/html; charset=utf-8",
                            }
                        });
                    };
                    case `/sub/${userID_Path}`: {
                        const url = new URL(request.url);
                        const searchParams = url.searchParams;
                        const วเลสSubConfig = สร้างวเลสSub(userID, request.headers.get('Host'));
                        // Construct and return response object
                        return new Response(btoa(วเลสSubConfig), {
                            status: 200,
                            headers: {
                                "Content-Type": "text/plain;charset=utf-8",
                            }
                        });
                    };
                    case `/bestip/${userID_Path}`: {
                        const headers = request.headers;
                        const url = `https://sub.xf.free.hr/auto?host=<span class="math-inline">\{request\.headers\.get\('Host'\)\}&uuid\=</span>{userID}&path=/`;
                        const bestSubConfig = await fetch(url, { headers: headers });
                        return bestSubConfig;
                    };
                    default:
                        // return new Response('Not found', { status: 404 });
                        // For any other path, reverse proxy to 'ramdom website' and return the original response, caching it in the process
                        const randomHostname = cn_hostnames[Math.floor(Math.random() * cn_hostnames.length)];
                        const newHeaders = new Headers(request.headers);
                        newHeaders.set('cf-connecting-ip', '1.2.3.4');
                        newHeaders.set('x-forwarded-for', '1.2.3.4');
                        newHeaders.set('x-real-ip', '1.2.3.4');
                        newHeaders.set('referer', 'https://www.google.com/search?q=edtunnel');
                        // Use fetch to proxy the request to 15 different domains
                        const proxyUrl = 'https://' + randomHostname + url.pathname + url.search;
                        let modifiedRequest = new Request(proxyUrl, {
                            method: request.method,
                            headers: newHeaders,
                            body: request.body,
                            redirect: 'manual',
                        });
                        const proxyResponse = await fetch(modifiedRequest, { redirect: 'manual' });
                        // Check for 302 or 301 redirect status and return an error response
                        if ([301, 302].includes(proxyResponse.status)) {
                            return new Response(`Redirects to ${randomHostname} are not allowed.`, {
                                status: 403,
                                statusText: 'Forbidden',
                            });
                        }
                        // Return the response from the proxy server
                        return proxyResponse;
                }
            } else {
                return await วเลสOverWSHandler(request);
            }
        } catch (err) {
            /** @type {Error} */ let e = err;
            return new Response(e.toString());
        }
    },
};

// ... 其他函数（uuid_validator, hashHex_f, วเลสOverWSHandler, 等等）...

/**
 *
 * @param {string} userID - single or comma separated userIDs
 * @param {string | null} hostName
 * @returns {string}
 */
function getวเลสConfig(userIDs, hostName) {
    const commonUrlPart = `:443?encryption=none&security=tls&sni=<span class="math-inline">\{hostName\}&fp\=randomized&type\=ws&host\=</span>{hostName}&path=%2F%3Fed%3D2048#${hostName}`;
    const hashSeparator = "################################################################";

    // Split the userIDs into an array
    const userIDArray = userIDs.split(",");

    // Prepare output string for each userID
    const output = userIDArray.map((userID) => {
        const วเลสMain = atob(pt) + '://' + userID + atob(at) + hostName + commonUrlPart;
        const วเลสSec = atob(pt) + '://' + userID + atob(at) + 优选IP + commonUrlPart; // 使用优选IP
        return `<h2>UUID: <span class="math-inline">\{userID\}</h2\></span>{hashSeparator}\nv2ray default ip
---------------------------------------------------------------
<span class="math-inline">\{วเลสMain\}
<button onclick\='copyToClipboard\("</span>{วเลสMain}")'><i class="fa fa-clipboard"></i> Copy วเลสMain</button>
---------------------------------------------------------------
v2ray with bestip
---------------------------------------------------------------
<span class="math-inline">\{วเลสSec\}
<button onclick\='copyToClipboard\("</span>{วเลสSec}")'><i class="fa fa-clipboard"></i> Copy วเลสSec</button>
---------------------------------------------------------------`;
    }).join('\n');
    const sublink = `https://<span class="math-inline">\{hostName\}/sub/</span>{userIDArray[0]}?format=clash`
    const subbestip = `https://<span class="math-inline">\{hostName\}/bestip/</span>{userIDArray[0]}`;
    const clash_link = `https://api.v1.mk/sub?target=clash&url=${encodeURIComponent(sublink)}&insert=false&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
    // Prepare header string
    const header = `
<p align='center'><img src='https://cloudflare-ipfs.com/ipfs/
