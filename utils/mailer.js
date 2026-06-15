const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
});


async function sendUserCreationMail(email, firstName, password) {
  try {
    const info = await transporter.sendMail({
      from: '"Dentilib" <dentilib@gmail.com>',
      to: email,
      subject: "Votre compte Dentilib",
      html: `
        <h2>Bienvenue ${firstName}</h2>
        <p>Votre compte a été créé avec succès.</p>
        <p><strong>Mot de passe :</strong> ${password}</p>
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
    sendUserCreationMail
};