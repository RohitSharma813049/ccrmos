const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' }); // Try local first
require('dotenv').config(); // Fallback to .env

async function testMail() {
  console.log('Testing Mail Configuration...');
  console.log(`Host: ${process.env.EMAIL_SERVER_HOST}`);
  console.log(`Port: ${process.env.EMAIL_SERVER_PORT}`);
  console.log(`User: ${process.env.EMAIL_SERVER_USER}`);
  
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error('Error: Email credentials are not set in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection successful!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: process.env.EMAIL_SERVER_USER, // Sending to yourself
      subject: "Test Email from CRM OS",
      text: "Hello! If you are reading this, your email configuration is working perfectly.",
      html: "<b>Hello!</b><br>If you are reading this, your email configuration is working perfectly.",
    });

    console.log('Message sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send email. Error details:');
    console.error(error);
  }
}

testMail();
