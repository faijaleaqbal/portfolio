/**
 * Portfolio Contact Submission Server
 * Provides reliable, zero-dependency contact form processing for faijaleaqbal.duckdns.org
 * Dispatches instant notifications via Telegram Bot to Admin & archives inquiries locally.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3150;
const HOST = '127.0.0.1';

// Telegram Bot Credentials (from lifeos-bot configuration)
const TELEGRAM_BOT_TOKEN = '8804014360:AAFqirK-V4o3BOZOElQj1dPor5yW1h-YOZo';
const TELEGRAM_CHAT_ID = '8433855679';

// Data storage directory
const DATA_DIR = path.join(__dirname, '..', 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.jsonl');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory rate limiting: IP -> [timestamps]
const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimits.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    rateLimits.set(ip, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  rateLimits.set(ip, validTimestamps);
  return false;
}

// Clean up old rate limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimits.entries()) {
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimits.delete(ip);
    } else {
      rateLimits.set(ip, valid);
    }
  }
}, 15 * 60 * 1000);

function sendTelegramMessage(text) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          console.error('[Telegram] Parse error:', e);
          resolve({ ok: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Telegram] Request error:', err.message);
      resolve({ ok: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Telegram timeout' });
    });

    req.write(payload);
    req.end();
  });
}

function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '*';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Health check endpoint
  if (req.method === 'GET' && (url.pathname === '/api/contact' || url.pathname === '/api/contact/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'portfolio-contact-api', timestamp: new Date().toISOString() }));
    return;
  }

  // Contact submission
  if (req.method === 'POST' && (url.pathname === '/api/contact' || url.pathname === '/api/contact/')) {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

    if (isRateLimited(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Too many messages submitted from your IP. Please try again in a few minutes.'
      }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50000) { // 50KB limit
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const name = (data.name || '').trim();
        const email = (data.email || '').trim();
        const service = (data.service || 'General Inquiry').trim();
        const budget = (data.budget || 'Not specified').trim();
        const message = (data.message || '').trim();

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name || name.length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Name must be at least 2 characters.' }));
          return;
        }

        if (!email || !emailRegex.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Valid email address required.' }));
          return;
        }

        if (!message || message.length < 5) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Message must be at least 5 characters.' }));
          return;
        }

        const record = {
          timestamp: new Date().toISOString(),
          ip: clientIp,
          name,
          email,
          service,
          budget,
          message,
          userAgent: req.headers['user-agent'] || 'unknown'
        };

        // Save to persistent file
        fs.appendFile(MESSAGES_FILE, JSON.stringify(record) + '\n', (err) => {
          if (err) console.error('[Storage] Error appending message:', err);
        });

        // Format Telegram Notification
        const telegramText = 
`🚀 *New Portfolio Transmission!*

👤 *Name:* ${escapeMarkdown(name)}
📧 *Email:* ${escapeMarkdown(email)}
🛠️ *Service:* ${escapeMarkdown(service)}
💰 *Budget:* ${escapeMarkdown(budget)}

💬 *Message:*
${escapeMarkdown(message)}

⏱️ _Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)_`;

        await sendTelegramMessage(telegramText);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Transmission successfully delivered to Md Faijal Eaqbal.'
        }));

      } catch (err) {
        console.error('[Handler] Request parsing error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload.' }));
      }
    });

    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`[Contact API] Listening on http://${HOST}:${PORT}`);
});
