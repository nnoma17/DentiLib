const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
});

/**
 * Echappe les caracteres HTML sensibles.
 * Les donnees inserees dans un corps d'e-mail HTML doivent etre echappees
 * pour eviter l'injection de contenu (HTML injection / phishing).
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendUserCreationMail(email, firstName, password) {
  try {
    const info = await transporter.sendMail({
      from: '"Dentilib" <dentilib@gmail.com>',
      to: email,
      subject: "Votre compte Dentilib",
      html: `
        <h2>Bienvenue ${escapeHtml(firstName)}</h2>
        <p>Votre compte a été créé avec succès.</p>
        <p><strong>Mot de passe :</strong> ${escapeHtml(password)}</p>
        <p>Ce message va s'autodétruire dans 30sec</p>
      `
    });
    console.log("Mail envoyé");
    console.log("📧 Mail envoyé :", info.messageId);
    console.log("🔗 Preview URL :", nodemailer.getTestMessageUrl(info));

  } catch (error) {
    throw error;
  }
}


module.exports = {
    transporter,
    sendUserCreationMail,
    escapeHtml
};