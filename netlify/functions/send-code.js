const { Resend } = require('resend');
const { getStore, connectLambda } = require('@netlify/blobs');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Initialize Netlify Blobs for Lambda compatibility mode
    connectLambda(event);

    const { email } = JSON.parse(event.body || '{}');
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }) };
    }

    const cleanEmail = email.toLowerCase().trim();
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Netlify Blobs
    const store = getStore('verification-codes');
    await store.set(cleanEmail, code);

    // Send email via Resend
    await resend.emails.send({
      from: 'noreply@uaecenter.work.gd',
      to: cleanEmail,
      subject: 'Your Verification Code',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Code sent successfully' })
    };
  } catch (error) {
    console.error('Error sending code:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Failed to send code' })
    };
  }
};
