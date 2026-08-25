import { findAll, findByQuery, updateById, create } from '../config/db.js';
import sendEmail from '../config/sendEmail.js';

const COLLECTION = 'abandonedCarts';
const REMINDER_AFTER_MS = 3 * 60 * 60 * 1000;

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export const saveAbandonedCart = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 50) : [];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !items.length) {
      return res.status(400).json({ success: false, message: 'Valid email and cart items are required.' });
    }
    const existing = (await findByQuery(COLLECTION, 'email', email)).find((cart) => cart.status === 'pending');
    const data = { email, items, updatedAt: new Date().toISOString(), status: 'pending' };
    const saved = existing ? await updateById(COLLECTION, existing._id, data) : await create(COLLECTION, data);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recoverAbandonedCartsForEmail = async (email) => {
  if (!email) return;
  const carts = await findByQuery(COLLECTION, 'email', String(email).trim().toLowerCase());
  await Promise.all(carts.filter((cart) => cart.status === 'pending').map((cart) => updateById(COLLECTION, cart._id, { status: 'recovered', recoveredAt: new Date().toISOString() })));
};

export const sendAbandonedCartReminders = async () => {
  const cutoff = Date.now() - REMINDER_AFTER_MS;
  const carts = (await findAll(COLLECTION)).filter((cart) => cart.status === 'pending' && new Date(cart.updatedAt || cart.createdAt).getTime() <= cutoff);
  let sent = 0;
  for (const cart of carts) {
    const items = cart.items || [];
    const itemList = items.map((item) => `<li>${escapeHtml(item.name)} (Qty: ${Number(item.quantity || 1)})</li>`).join('');
    const response = await sendEmail({
      sendTo: cart.email,
      subject: 'Your Aaramdehi comfort picks are waiting',
      html: `<h2>You left something comfortable behind</h2><p>Your selected items are still waiting in your cart.</p><ul>${itemList}</ul><p><a href="${process.env.FRONTEND_URL || 'https://www.aaramdehi.co.in'}/cart">Return to your cart</a></p><p style="font-size:12px;color:#666">You are receiving this reminder because you added items to your Aaramdehi cart.</p>`
    });
    if (response.success) {
      sent += 1;
      await updateById(COLLECTION, cart._id, { status: 'reminded', remindedAt: new Date().toISOString() });
    }
  }
  return { sent, checked: carts.length };
};
