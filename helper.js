require("dotenv").config({ path: __dirname + "/.env" });
const fs = require("fs");
const nodemailer = require("nodemailer");
const MailError = require("./mailerror");

module.exports = sendMail = html => {
  return new Promise(async (resolve, reject) => {
    const MAILHOST = process.env.MAILHOST;
    const MAILUSER = process.env.MAILUSER;
    const MAILPW = process.env.MAILPW;
    const MAILPORT = process.env.MAILPORT;
    const MAILRECEIVER = process.env.MAILRECEIVER;
    try {
      let transporter = nodemailer.createTransport({
        host: MAILHOST,
        port: MAILPORT,
        auth: {
          user: MAILUSER,
          pass: MAILPW
        }
      });

      let mailOptions = {
        from: "jobcrawler@cron.io",
        to: MAILRECEIVER,
        subject: `Message from jobcrawler`,
        text: html,
        html: html
      };
      const info = await transporter.sendMail(mailOptions);
      resolve(info);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      throw new MailError(error);
    }
  });
};
