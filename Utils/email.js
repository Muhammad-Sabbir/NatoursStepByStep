const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    // host: 'Gmail',
    host: process.env.EMAIL_HOST, // this fucking line took so many time from me.
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
    // lets use mailtrap for testing email.
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Sabbir Ahamed <testuser@sabbir.tech>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
