const http = require('http');

const PORT = 57606;
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
    // Normalise trailing slash before query string (e.g. /EdvironnResponse/?... -> /EdvironnResponse?...)
    const cleanUrl = req.url.replace('/?', '?');
    const targetUrl = `http://localhost:${TARGET_PORT}${cleanUrl}`;
    console.log(`[Port 57606 Proxy] ${req.method} ${req.url} -> ${targetUrl}`);

    if (req.method === 'GET' || req.method === 'HEAD') {
        res.writeHead(307, {
            'Location': targetUrl,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
        });
        res.end();
        return;
    }

    // For POST/PUT requests, forward the full request body to Next.js
    const bodyChunks = [];
    req.on('data', chunk => bodyChunks.push(chunk));
    req.on('end', () => {
        const bodyBuffer = Buffer.concat(bodyChunks);
        const options = {
            hostname: 'localhost',
            port: TARGET_PORT,
            path: cleanUrl,
            method: req.method,
            headers: {
                ...req.headers,
                host: `localhost:${TARGET_PORT}`,
                'content-length': bodyBuffer.length
            }
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('[Port 57606 Proxy] Forwarding error:', err.message);
            // Fallback redirect on error
            res.writeHead(307, { 'Location': targetUrl });
            res.end();
        });

        proxyReq.write(bodyBuffer);
        proxyReq.end();
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`[Port 57606 Proxy] Port ${PORT} is already in use by another process.`);
    } else {
        console.error('[Port 57606 Proxy] Error:', err);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Port 57606 Proxy] Active and listening on http://localhost:${PORT} -> redirecting to http://localhost:${TARGET_PORT}`);
});
