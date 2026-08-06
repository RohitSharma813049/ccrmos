require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testMail() {
  console.log("Checking email configuration...");
  
  const {
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD,
    EMAIL_FROM
  } = process.env;

  if (!EMAIL_SERVER_HOST || !EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD) {
    console.error("❌ Missing one or more email environment variables in .env.local!");
    console.log("Found:", { EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_FROM });
    process.exit(1);
  }

  console.log(`Connecting to SMTP server: ${EMAIL_SERVER_HOST}:${EMAIL_SERVER_PORT} as ${EMAIL_SERVER_USER}`);

  const transporter = nodemailer.createTransport({
    host: EMAIL_SERVER_HOST,
    port: parseInt(EMAIL_SERVER_PORT || "465"),
    secure: parseInt(EMAIL_SERVER_PORT || "465") === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_SERVER_USER,
      pass: EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    console.log("Verifying connection to SMTP server...");
    await transporter.verify();
    console.log("✅ Connection verified successfully!");

    const testEmailAddress = EMAIL_SERVER_USER; // Send the test email to themselves
    
    console.log(`Sending test email to ${testEmailAddress}...`);
    
    const info = await transporter.sendMail({
      from: `"CRM OS Test" <${EMAIL_FROM || EMAIL_SERVER_USER}>`,
      to: testEmailAddress,
      subject: "✅ Your CRM OS Email is Working!",
      text: "Congratulations! If you are reading this, your SMTP configuration in .env.local is perfectly correct and mail is working properly.",
      html: "<h3>Congratulations!</h3><p>If you are reading this, your SMTP configuration in <b>.env.local</b> is perfectly correct and mail is working properly.</p>",
    });

    console.log("✅ Message sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\nIf you don't see the email in your inbox, check your spam/junk folder.");
    
  } catch (error) {
    console.error("\n❌ Error during email test:");
    console.error(error.message);
    if (error.code === 'EAUTH') {
      console.log("\n💡 HINT: Authentication failed. If using Gmail, make sure you generated an 'App Password' instead of using your normal account password. Also check if 2-Step Verification is enabled.");
    }
  }
}

testMail();
