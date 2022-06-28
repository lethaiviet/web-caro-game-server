import { EMAIL_ACCESS_TOKEN, EMAIL_CLIENT_ID, EMAIL_CLIENT_SECRET, EMAIL_REFRESH_TOKEN, FORDER_PATH } from '@/config';
import { createTransport, Transporter } from 'nodemailer';
import { logger } from './logger';
import os from 'os';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Mail from 'nodemailer/lib/mailer';
import { getContentFile } from './fileUtils';

class EmailUtils {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private verifyAccountEmailTemplate = FORDER_PATH['email-template'].concat('/verify-account-email-template.html');
  private adminEmail = 'ad.caro.game@gmail.com';

  constructor() {
    //workaround the bug only appear on window 7
    //https://github.com/nodemailer/nodemailer/issues/1410
    os.hostname = () => 'localhost';

    const smtpConfig: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: this.adminEmail,
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
        accessToken: EMAIL_ACCESS_TOKEN,
      },
    };

    try {
      this.transporter = createTransport(smtpConfig);
    } catch (e) {
      logger.error('Cannot create connection to gmail with error: ' + e);
    }
  }

  async sendMessage(to: string, subject: string, html: string) {
    const mailOptions: Mail.Options = {
      from: `Admin-Caro-Game <${this.adminEmail}>`,
      to,
      subject,
      text: html,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      logger.error('Cannot send email with error: ' + e);
    }
  }

  async sendVerifyAccountEmail(to: string, verifyAccountUrl: string) {
    const emailTemp = getContentFile(this.verifyAccountEmailTemplate);
    const verifyAccountEmail = emailTemp.replace(/{{VERIFY_ACCOUNT_URL}}/g, verifyAccountUrl);
    const subject = '[Caro Game] Confirm your account';
    this.sendMessage(to, subject, verifyAccountEmail);
  }
}

export default new EmailUtils();
