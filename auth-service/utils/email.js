const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');



module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `TeamMate <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    console.log(process.env.GMAIL_PASSWORD);
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL,
          pass: process.env.GMAIL_PASSWORD
        }
    })
  }

  async send(template, subject) {
    //Send the actual email
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    //2) Define email options
    const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    html,
    text: htmlToText.fromString(html)
    // html:
    }

    // 3)Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
    //await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
   await this.send(`welcome`, `Welcome to TeamMate!`)

  }

  async sendPasswordReset() {
    await this.send(`passwordReset`, `Your password reset token (valid for only 10 minutes!)`)
  }
}