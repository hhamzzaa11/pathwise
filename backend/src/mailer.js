const nodemailer = require('nodemailer');
let transport;
const mailEnabled = () => !!(process.env.SMTP_HOST && process.env.CONTACT_TO);
function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
  }
  return transport;
}
// Plain-text only (no HTML) so user input can never inject markup into the email.
async function sendMail({ replyTo, subject, text }) {
  if (!mailEnabled()) return false;
  await getTransport().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || process.env.CONTACT_TO,
    to: process.env.CONTACT_TO, replyTo, subject, text
  });
  return true;
}
module.exports = { mailEnabled, sendMail };
