import http from 'node:http';
import tls from 'node:tls';

// Vercel Serverless Function (Node.js runtime)
// Relays SaaSPay Payout API requests through the whitelisted Webshare static IP (198.23.243.226)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, x-relay-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payload, idempotencyKey, apiKey } = req.body || {};
    const key = apiKey || req.headers['authorization']?.replace('Bearer ', '') || process.env.SAASPAY_SECRET_KEY;
    const idemKey = idempotencyKey || req.headers['idempotency-key'] || `relay-${Date.now()}`;

    if (!key) {
      return res.status(401).json({ error: 'Clé API SaaSPay requise' });
    }

    const proxyHost = process.env.WEBSHARE_PROXY_HOST || 'p.webshare.io';
    const proxyPort = Number(process.env.WEBSHARE_PROXY_PORT || 80);
    const proxyUser = process.env.WEBSHARE_PROXY_USER || 'gkkoqjad-1';
    const proxyPass = process.env.WEBSHARE_PROXY_PASS || 'se6uv3i8h2dg';

    const bodyStr = JSON.stringify(payload || {});
    const targetHost = 'api.saspay.me';
    const targetPath = '/api/v1/payouts/initialize/';

    const proxyAuth = Buffer.from(`${proxyUser}:${proxyPass}`).toString('base64');

    const result = await new Promise((resolve, reject) => {
      const connectReq = http.request({
        host: proxyHost,
        port: proxyPort,
        method: 'CONNECT',
        path: `${targetHost}:443`,
        headers: {
          'Proxy-Authorization': `Basic ${proxyAuth}`,
          'Host': `${targetHost}:443`,
        },
        timeout: 15000,
      });

      connectReq.on('connect', (proxyRes, socket) => {
        if (proxyRes.statusCode !== 200) {
          return reject(new Error(`Proxy CONNECT error: ${proxyRes.statusCode}`));
        }

        const tlsSocket = tls.connect({
          socket,
          servername: targetHost,
        });

        tlsSocket.on('secureConnect', () => {
          let reqHeader = `POST ${targetPath} HTTP/1.1\r\n`;
          reqHeader += `Host: ${targetHost}\r\n`;
          reqHeader += `Authorization: Bearer ${key}\r\n`;
          reqHeader += `Content-Type: application/json\r\n`;
          reqHeader += `Idempotency-Key: ${idemKey}\r\n`;
          reqHeader += `Content-Length: ${Buffer.byteLength(bodyStr)}\r\n`;
          reqHeader += `Connection: close\r\n\r\n`;

          tlsSocket.write(reqHeader);
          tlsSocket.write(bodyStr);
        });

        let respRaw = '';
        tlsSocket.on('data', (chunk) => {
          respRaw += chunk.toString('utf8');
        });

        tlsSocket.on('end', () => {
          try {
            const splitIdx = respRaw.indexOf('\r\n\r\n');
            const headerPart = respRaw.slice(0, splitIdx);
            const bodyPart = respRaw.slice(splitIdx + 4);
            const statusLine = headerPart.split('\r\n')[0];
            const statusCode = parseInt(statusLine.split(' ')[1], 10) || 500;
            const parsedData = JSON.parse(bodyPart);
            resolve({ status: statusCode, data: parsedData });
          } catch (pErr) {
            reject(new Error(`Failed to parse SaaSPay response: ${respRaw.slice(0, 200)}`));
          }
        });

        tlsSocket.on('error', reject);
      });

      connectReq.on('timeout', () => {
        connectReq.destroy();
        reject(new Error('Proxy connection timeout'));
      });

      connectReq.on('error', reject);
      connectReq.end();
    });

    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error('[saaspay-payout-relay] error:', err);
    return res.status(500).json({ error: err.message || 'Erreur relais SaaSPay' });
  }
}
