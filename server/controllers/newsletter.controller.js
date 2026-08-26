import { findAll, findById, create, updateById, deleteById, findByQuery } from '../config/db.js';
import { validateEmail } from '../utils/validation.js';
import sendEmail from '../config/sendEmail.js';

const COLLECTION = 'newsletterSubscribers';

export const subscribeNewsletter = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const source = String(req.body.source || 'newsletter').trim().slice(0, 50);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const existingSubscribers = await findByQuery(COLLECTION, 'email', email);
    if (existingSubscribers.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already subscribed.' });
    }

    const newSubscriber = await create(COLLECTION, {
      email,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      source,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
      subscriber: newSubscriber,
    });
  } catch (error) {
    console.error('❌ [Newsletter Subscribe Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = (await findAll(COLLECTION)).filter((subscriber) => subscriber.status !== 'unsubscribed');
    const sorted = subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
    return res.json({ success: true, data: sorted });
  } catch (error) {
    console.error('❌ [Newsletter Subscribers Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNewsletterSubscriber = async (req, res) => {
  try {
    const subscriber = await findById(COLLECTION, req.params.id);
    if (!subscriber) return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    const status = req.body.status === 'unsubscribed' ? 'unsubscribed' : 'active';
    return res.json({ success: true, data: await updateById(COLLECTION, req.params.id, { status }) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNewsletterSubscriber = async (req, res) => {
  try {
    const subscriber = await findById(COLLECTION, req.params.id);
    if (!subscriber) return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    await deleteById(COLLECTION, req.params.id);
    return res.json({ success: true, message: 'Subscriber deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendNewsletter = async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const storedSubscribers = (await findAll(COLLECTION)).filter((subscriber) => subscriber.status !== 'unsubscribed');
    const requestedRecipients = Array.isArray(recipients)
      ? [...new Set(recipients.map((email) => String(email).trim().toLowerCase()).filter((email) => validateEmail(email)))]
      : [];
    if (requestedRecipients.length > 5000) {
      return res.status(400).json({ success: false, message: 'A maximum of 5,000 recipients can be emailed at once.' });
    }

    const recipientEmails = requestedRecipients.length > 0
      ? requestedRecipients
      : storedSubscribers.map((subscriber) => subscriber.email).filter((email) => validateEmail(email));
    if (!recipientEmails.length) {
      return res.status(400).json({ success: false, message: 'No subscribers available to send newsletter.' });
    }

    const template = (email) => `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.6;">
        <h1 style="color:#1A365D;">Aaramdehi Newsletter</h1>
        <p>Hi,</p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <p style="margin-top:30px;">Thank you for staying connected with us.</p>
        <p style="font-size:12px;color:#555;">If you no longer wish to receive these emails, please reply with "unsubscribe".</p>
      </div>
    `;

    const sendPromises = recipientEmails.map((email) =>
      sendEmail({
        sendTo: email,
        subject: subject.trim(),
        html: template(email),
      }).then((result) => ({ email, success: result.success }))
        .catch((error) => ({ email, success: false, error: error.message }))
    );

    const results = await Promise.allSettled(sendPromises);
    const sent = results.filter((item) => item.status === 'fulfilled' && item.value.success).length;
    const failed = results.filter((item) => item.status === 'fulfilled' && !item.value.success).length + results.filter((item) => item.status === 'rejected').length;

    return res.json({
      success: true,
      message: `Newsletter has been sent to ${sent} recipient(s). ${failed ? `${failed} delivery(s) failed.` : ''}`,
      stats: { sent, failed, total: recipientEmails.length, source: requestedRecipients.length > 0 ? 'csv' : 'subscribers' },
    });
  } catch (error) {
    console.error('❌ [Send Newsletter Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
