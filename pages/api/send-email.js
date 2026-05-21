export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Resend API key manquante' });

  const { to, diagnostic, soin, type } = req.body;

  const isToClient = type === 'client';
  const recipient = isToClient ? to : 'husnabeautystudio@gmail.com';
  const subject = isToClient 
    ? '✨ Ton diagnostic de peau Husna Beauty' 
    : '📋 Nouveau diagnostic client — Husna Beauty';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#ede1d2;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
    
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="background:#5d2510;display:inline-block;padding:1.5rem 2rem;border-radius:16px;">
        <div style="color:#ede1d2;font-size:0.7rem;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:0.3rem;">Husna Beauty Studio</div>
        <div style="color:#fff;font-size:1.4rem;font-weight:700;">✦ Diagnostic de Peau</div>
      </div>
    </div>

    <div style="background:#fff;border-radius:20px;padding:2rem;box-shadow:0 4px 20px rgba(65,47,38,0.1);margin-bottom:1.5rem;">
      <h2 style="color:#5d2510;font-size:1.2rem;margin-bottom:1.2rem;border-bottom:1px solid #ede1d2;padding-bottom:0.8rem;">
        ${isToClient ? '✨ Ton analyse de peau personnalisée' : '📋 Diagnostic reçu'}
      </h2>
      <div style="color:#412F26;font-size:0.9rem;line-height:1.7;white-space:pre-wrap;">${diagnostic.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/## /g, '').replace(/# /g, '')}</div>
    </div>

    ${soin ? `
    <div style="background:linear-gradient(135deg,#5d2510,#7a3520);border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;">
      <div style="color:rgba(237,225,210,0.7);font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:0.5rem;">✦ Soin recommandé</div>
      <div style="color:#fff;font-size:1.1rem;font-weight:700;margin-bottom:0.3rem;">${soin.nom}</div>
      <div style="color:#d49d10;font-size:1rem;font-weight:700;margin-bottom:0.5rem;">${soin.prix} · ${soin.duree}</div>
      <p style="color:rgba(237,225,210,0.85);font-size:0.85rem;line-height:1.6;margin-bottom:1rem;">${soin.desc}</p>
      <a href="https://prolybook.com/pro/husna-beauty-0o6bcg/marseille/13016" 
         style="display:block;background:#d49d10;color:#412F26;text-align:center;border-radius:50px;padding:0.8rem 1.5rem;font-size:0.88rem;font-weight:700;text-decoration:none;">
        Réserver ce soin chez Husna Beauty →
      </a>
    </div>
    ` : ''}

    <div style="text-align:center;color:rgba(93,37,16,0.5);font-size:0.7rem;letter-spacing:0.1em;">
      HUSNA BEAUTY STUDIO · DIAGNOSTIC IA · husnabeauty.fr
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Husna Beauty <onboarding@resend.dev>',
        to: [recipient],
        subject,
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
