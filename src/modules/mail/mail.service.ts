import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly maxRetries = 3;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(user: User, token: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('RESET_PASSWORD_URL')}?token=${token}`;
    
    return this.sendEmailWithRetry(
      user.email,
      'Password Reset Request',
      'forgot-password',
      {
        name: `${user.firstName} ${user.lastName}`,
        resetUrl,
        expiryTime: '1 hour',
      },
    );
  }

  async sendPasswordChangedNotification(user: User): Promise<boolean> {
    return this.sendEmailWithRetry(
      user.email,
      'Password Changed Successfully',
      'password-changed',
      {
        name: `${user.firstName} ${user.lastName}`,
        changeTime: new Date().toLocaleString(),
      },
    );
  }

  async sendWelcomeEmail(user: User, tempPassword?: string): Promise<boolean> {
    return this.sendEmailWithRetry(
      user.email,
      'Welcome to NestJS App',
      'welcome',
      {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        tempPassword,
        loginUrl: this.configService.get('APP_URL') || 'http://localhost:3000',
      },
    );
  }

  private async sendEmailWithRetry(
    to: string,
    subject: string,
    template: string,
    context: any,
    retryCount = 0,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      
      this.logger.log(`Email sent successfully to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      
      if (retryCount < this.maxRetries) {
        this.logger.log(`Retrying email send (${retryCount + 1}/${this.maxRetries})`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.sendEmailWithRetry(to, subject, template, context, retryCount + 1);
      }
      
      this.logger.error(`Failed to send email after ${this.maxRetries} retries`);
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: 'test@example.com',
        subject: 'Test Email Connection',
        text: 'This is a test email to verify the connection.',
      });
      this.logger.log('Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error.message);
      return false;
    }
  }
}
