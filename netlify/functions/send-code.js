const { Resend } = require('resend');

// In-memory code store (For production, use Netlify Blobs or a free database like Upstash Redis)
global.verificationCodes = global.verificationCodes || {};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 455, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Generate 4-digit verification code
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Store code with 10-minute expiration
  global.verificationCodes[email] = {
    code: code,
    expiresAt: Date.now() + 10 * 60 * 1000
  };

  try {
    await resend.emails.send({
      from: 'UAE Training Center <onboarding@resend.dev>', // Netlify/Resend test sender
      to: email,
      subject: 'Your Verification Code - UAE Training Center',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your 4-digit verification code is:</p>
          <h1 style="color: #1e3a8a; letter-spacing: 4px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Code sent successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
