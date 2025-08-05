const nodemailer = require("nodemailer");

// Nodemailer

const sendEmail = async (options) => {
  // 1-) Create transporter (service thate will send email linke 'gmail','Mailgun','Mailtrap','sendGrrid' )
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false port =587,if true port= 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) Define email options (like from,to, supject ,email content)
  const mailOptin = {
    from:"EBN HAIAN <ebnhaian707@gimail.com>",
    to:options.email,
    subject:options.subject,
    text:options.meassage,
  };
  //3) Send email
  await transporter.sendMail(mailOptin);
};

module.exports = sendEmail;
