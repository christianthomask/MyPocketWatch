import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(message: string): Promise<boolean> {
  if (!process.env.TWILIO_PHONE_NUMBER || !process.env.USER_PHONE_NUMBER) {
    console.warn('Twilio not configured — skipping SMS');
    return false;
  }

  try {
    await client.messages.create({
      body: `🚨 PocketWatch: ${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.USER_PHONE_NUMBER,
    });
    return true;
  } catch (error) {
    console.error('SMS send failed:', error);
    return false;
  }
}
