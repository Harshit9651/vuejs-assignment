
const twilio = require('twilio');

const accountSid = process.env.TWILLIO_DEV_ACCOUNT_SID;
const authToken = process.env.TWILLIO_DEV_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


const sendMessage = async (to, body) => {
    try {
        const message = await client.messages.create({
            body,
            from: process.env.TWILLIO_DEV_PNUMBER,
            to:to
        });
        console.log(`Message sent with SID: ${message.sid}`);
        return message.sid;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

module.exports = {
    sendMessage
};
