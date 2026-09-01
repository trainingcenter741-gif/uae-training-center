exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, code } = JSON.parse(event.body);
  const record = global.verificationCodes ? global.verificationCodes[email] : null;

  if (!record) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No verification code requested for this email.' })
    };
  }

  if (Date.now() > record.expiresAt) {
    delete global.verificationCodes[email];
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Verification code expired. Request a new one.' })
    };
  }

  if (record.code === code) {
    delete global.verificationCodes[email];
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email verified successfully!' })
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid verification code.' })
    };
  }
};
