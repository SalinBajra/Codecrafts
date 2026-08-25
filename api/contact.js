const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, limit) {
  return String(value || '').trim().slice(0, limit);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const name = clean(req.body?.name, 100);
  const email = clean(req.body?.email, 200).toLowerCase();
  const company = clean(req.body?.company, 150);
  const service = clean(req.body?.service, 120);
  const timeline = clean(req.body?.timeline, 30);
  const project = clean(req.body?.project, 5000);
  const website = clean(req.body?.website, 200);
  if (website) return res.status(200).json({ ok: true });
  if (name.length < 2 || !EMAIL_PATTERN.test(email) || project.length < 10) {
    return res.status(400).json({ error: 'Please complete your name, email and project details.' });
  }
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO || !process.env.CONTACT_FROM) {
    return res.status(503).json({ error: 'Enquiries are temporarily unavailable. Please try again shortly.' });
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_TO],
        reply_to: email,
        subject: `New CodeCrafts enquiry from ${name}`,
        html: `<h2>New project enquiry</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Company:</strong> ${escapeHtml(company || 'Not provided')}</p><p><strong>Service:</strong> ${escapeHtml(service || 'Not specified')}</p><p><strong>Target launch:</strong> ${escapeHtml(timeline || 'Not specified')}</p><p><strong>What should improve:</strong></p><p>${escapeHtml(project).replace(/\n/g, '<br>')}</p>`
      })
    });
    if (!response.ok) throw new Error('Email provider rejected request');
    return res.status(200).json({ ok: true });
  } catch (_) {
    return res.status(502).json({ error: 'We could not send your enquiry. Please try again.' });
  }
};
