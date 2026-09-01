const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, code } = JSON.parse(event.body || '{}');
    if (!email || !code) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email and code are required' }) };
    }

    const cleanEmail = email.toLowerCase().trim();
    const store = getStore('verification-codes');

    // Fetch stored code from Netlify Blobs
    const storedCode = await store.get(cleanEmail);

    if (!storedCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No verification code requested for this email.' })
      };
    }

    if (storedCode !== code.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid verification code.' })
      };
    }

    // Code matches — delete it so it can't be reused
    await store.delete(cleanEmail);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Verification successful!' })
    };
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Verification failed' })
    };
  }
};
