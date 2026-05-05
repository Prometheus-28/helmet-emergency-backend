const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

// ⚙️ Apni credentials yahan daalo
const accountSid = process.env.TWILIO_SID;
const authToken  = process.env.TWILIO_TOKEN;
const fromNumber = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

app.get('/', (req, res) => {
  res.json({ status: 'Emergency Alert Server running ✅' });
});

app.post('/send-emergency', async (req, res) => {
  const { message, numbers } = req.body;

  if (!message || !numbers || numbers.length === 0) {
    return res.status(400).json({ error: 'message aur numbers required hain' });
  }

  const results = [];

  for (const number of numbers) {
    try {
      const msg = await client.messages.create({
        body: message,
        from: fromNumber,
        to: number,
      });
      results.push({ number, status: 'sent', sid: msg.sid });
    } catch (err) {
      results.push({ number, status: 'failed', error: err.message });
    }
  }

  const anySuccess = results.some(r => r.status === 'sent');
  res.json({ success: anySuccess, results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
