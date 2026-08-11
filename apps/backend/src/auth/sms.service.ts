import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SmsGateway {
  sendSms(phoneNumber: string, message: string): Promise<boolean>;
}

@Injectable()
export class MockSmsGateway implements SmsGateway {
  private readonly logger = new Logger(MockSmsGateway.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    void this.initMailTransporter();
  }

  private async initMailTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(
        `Initialized custom SMTP mail transporter pointing to ${host}`,
      );
    } else {
      // Fallback: Create ethereal test account for local previewing
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(
          `Initialized Ethereal test mail transporter (User: ${testAccount.user})`,
        );
      } catch (err) {
        this.logger.error(
          'Failed to initialize Ethereal mail transporter fallback',
          err,
        );
      }
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    this.logger.log(`[MOCK SMS] Sending to ${phoneNumber}: "${message}"`);

    const emailTo = process.env.OTP_EMAIL_TO || 'maxpro190@gmail.com';
    if (this.transporter && emailTo) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const info = await this.transporter.sendMail({
          from:
            process.env.SMTP_FROM ||
            '"MasahaDesk Security" <no-reply@masahadesk.com>',
          to: emailTo,
          subject: 'MasahaDesk OTP Verification Code / رمز التحقق',
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px; background-color: #f7f5f0; border-radius: 8px; border: 1px solid #d9d0c0; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #cc8000; font-family: sans-serif; font-weight: bold; margin-bottom: 15px;">MasahaDesk Security / أمن مساحة ديسك</h2>
            <p style="font-size: 16px; color: #202020; line-height: 1.6; margin-bottom: 20px;">${message}</p>
            <p style="font-size: 12px; color: #808080; border-top: 1px solid #d9d0c0; padding-top: 10px; margin-top: 20px;">This is an automated security verification email. Please do not share this code.</p>
          </div>`,
        });

        this.logger.log(
          `[EMAIL SENT] Successfully sent OTP message to ${emailTo}`,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(
            `[EMAIL PREVIEW] Ethereal Preview URL: ${previewUrl}`,
          );
        }
      } catch (err) {
        this.logger.error(`Failed to send OTP email to ${emailTo}`, err);
      }
    }

    return true;
  }
}

@Injectable()
export class TaqnyatSmsGateway implements SmsGateway {
  private readonly logger = new Logger(TaqnyatSmsGateway.name);

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    const apiKey = process.env.SMS_GATEWAY_API_KEY;
    const sender = process.env.SMS_GATEWAY_SENDER || 'MasahaDesk';

    if (!apiKey) {
      this.logger.error(
        'Taqnyat API Key is not configured. Failed to send SMS.',
      );
      return false;
    }

    // Format phone to E.164 without leading plus for Saudi Taqnyat (e.g. 9665xxxxxxxx)
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('05')) {
      formattedPhone = '966' + formattedPhone.slice(1);
    }

    try {
      this.logger.log(`Sending Taqnyat SMS to ${formattedPhone}...`);
      const response = await fetch('https://api.taqnyat.sa/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          recipients: [formattedPhone],
          sender: sender,
          body: message,
        }),
      });

      const data = (await response.json()) as {
        statusCode?: number;
        message?: string;
      };
      if (response.ok) {
        this.logger.log('Taqnyat SMS sent successfully.');
        return true;
      } else {
        this.logger.error(
          `Taqnyat SMS failed. Code: ${response.status}, Message: ${JSON.stringify(data)}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error('Failed calling Taqnyat SMS API', error);
      return false;
    }
  }
}

@Injectable()
export class SmsService implements SmsGateway {
  private gateway: SmsGateway;

  constructor(
    private readonly mockGateway: MockSmsGateway,
    private readonly taqnyatGateway: TaqnyatSmsGateway,
  ) {
    const apiKey = process.env.SMS_GATEWAY_API_KEY;
    if (!apiKey || apiKey === 'mock-api-key') {
      this.gateway = this.mockGateway;
    } else {
      this.gateway = this.taqnyatGateway;
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    return this.gateway.sendSms(phoneNumber, message);
  }
}
