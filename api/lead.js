// ════════════════════════════════════════════════════════════
//  api/lead.js — Cerebro de avisos 24/7 de Visionarios Company
//  Recibe un lead de la web y avisa al WhatsApp de Jefferson
//  vía CallMeBot. La apikey se guarda como variable secreta en
//  Vercel (CALLMEBOT_APIKEY) para no exponerla en el repo público.
// ════════════════════════════════════════════════════════════

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Solo POST" });
    return;
  }

  try {
    const b = (req.body && typeof req.body === "object") ? req.body : {};

    // CallMeBot no acepta emojis ni acentos: dejamos texto ASCII limpio
    const limpio = (v) =>
      String(v == null ? "" : v)
        .normalize("NFKD")
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const nombre = limpio(b.nombre) || "?";
    const telefono = limpio(b.telefono) || "?";
    const interes = limpio(b.interes) || "?";
    const origen = limpio(b.origen) || "Web";
    const mensaje = limpio(b.mensaje) || "-";
    const soloDigitos = telefono.replace(/[^0-9]/g, "");

    const texto =
      "NUEVO LEAD - " + nombre +
      ". Tel: " + telefono +
      ". Interes: " + interes +
      ". Origen: " + origen +
      ". Mensaje: " + mensaje +
      (soloDigitos ? ". Escribele ya: https://wa.me/34" + soloDigitos : "");

    const apikey = process.env.CALLMEBOT_APIKEY;
    const phone = process.env.CALLMEBOT_PHONE || "34675048731";

    if (apikey) {
      const url =
        "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(phone) +
        "&text=" + encodeURIComponent(texto) +
        "&apikey=" + encodeURIComponent(apikey);
      await fetch(url).catch(() => {});
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    // Nunca devolvemos error al navegador: el lead ya viajó también por email
    res.status(200).json({ ok: false });
  }
};
