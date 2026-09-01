const { Resend } = require('resend');
const { getStore } = require('@netlify/blobs');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }) };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save code to Netlify Blobs (key = normalized email)
    const store = getStore('verification-codes');
    await store.set(email.toLowerCase().trim(), code);

    // Send email via Resend
    await resend.emails.send({
      from: 'noreply@uaecenter.work.gd', // Ensure domain is verified in Resend
      to: email,
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
