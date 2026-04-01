const express = require('express');
const nodemailer = require('nodemailer');
const validator = require('validator');

const router = express.Router();

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

router.post('/send', async (req, res) => {
  try {
    const { fromEmail, message } = req.body || {};

    if (!fromEmail || !validator.isEmail(String(fromEmail))) {
      return res.status(400).json({
        message: 'A valid sender email address is required.',
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        message: 'Message is required.',
      });
    }

    const safeMessage = String(message).trim();
    if (safeMessage.length > 5000) {
      return res.status(400).json({
        message: 'Message is too long. Please keep it under 5000 characters.',
      });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || gmailUser;

    if (!gmailUser || !gmailAppPassword || !receiverEmail) {
      return res.status(500).json({
        message:
          'Email service is not configured. Please set GMAIL_USER, GMAIL_APP_PASSWORD, and CONTACT_RECEIVER_EMAIL in server .env.',
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const now = new Date();
    const escapedFromEmail = escapeHtml(String(fromEmail));
    const escapedMessage = escapeHtml(safeMessage).replaceAll('\n', '<br/>');

    await transporter.sendMail({
      from: `Portfolio Contact <${gmailUser}>`,
      to: receiverEmail,
      replyTo: String(fromEmail),
      subject: `New Portfolio Comment from ${String(fromEmail)}`,
      text: `New message from portfolio viewer\n\nFrom: ${String(fromEmail)}\nReceived: ${now.toISOString()}\n\nMessage:\n${safeMessage}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#2f2c2c;">
          <h2 style="margin:0 0 12px;color:#474343;">New Portfolio Message</h2>
          <p style="margin:0 0 8px;"><strong>From:</strong> ${escapedFromEmail}</p>
          <p style="margin:0 0 12px;"><strong>Received:</strong> ${escapeHtml(now.toISOString())}</p>
          <div style="padding:12px;border:1px solid #ececec;border-radius:8px;background:#fafafa;">
            ${escapedMessage}
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      message: 'Your message has been sent successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send message. Please try again later.',
      error: error.message,
    });
  }
});

module.exports = router;