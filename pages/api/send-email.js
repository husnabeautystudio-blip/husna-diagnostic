export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Resend API key manquante' });

  const { diagnostic, soin } = req.body;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ede1d2;padding:2rem;">
  <div style="background:#5d2510;padding:1.5rem;border-radius:12px;text-align:center;margin-bottom:1.5rem;">
    <h1 style="color:#fff;font-size:1.2rem;margin:0;">✦ Nouveau Diagnostic Husna Beauty</h1>
  </div>
  <div style="background:#fff;padding:1.5rem;border-radius:12px;margin-bottom:1rem;">
    <h2 style="color:#5d2510;font-size:1rem;margin-bottom:1rem;">Analyse de peau</h2>
    <div style="color:#412F26;font-size:0.9rem;line-height:1.7;white-space:pre-wrap;">${diagnostic}</div>
  </div>
  ${soin ? `
  <div style="background:#5d2510;padding:1.5rem;border-radius:12px;">
    <p style="color:rgba(237,225,210,0.7);font-size:0.7rem;margin:0 0 0.5rem;">SOIN RECOMMANDÉ</p>
    <h3 style="color:#fff;margin:0 0 0.3rem;">${soin.nom}</h3>
    <p style="color:#d49d10;font-weight:700;margin:0 0 0.5rem;">${soin.prix} · ${soin.duree}</p>
    <p style="color:rgba(237,225,210,0.85);font-size:0.85rem;">${soin.desc}</p>
  </div>` : ''}
</div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Husna Beauty <onboarding@resend.dev>',
        to: ['husnabeautystudio@gmail.com'],
        subject: '✨ Nouveau diagnostic client — Husna Beauty',
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
