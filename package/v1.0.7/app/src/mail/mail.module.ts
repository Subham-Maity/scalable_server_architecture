import { Logger, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailConfig } from './config/mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mailConfig = new MailConfig(configService);
        try {
          return {
            transport: {
              host: 'smtp.gmail.com',
              auth: {
                user: mailConfig.senderGmail,
                //https://myaccount.google.com/apppasswords to generate app password
                pass: mailConfig.appSenderPassword,
              },
            },
            defaults: {
              from: mailConfig.defaultSenderGmail,
            },
            template: {
              dir:
                process.cwd() +
                (process.env.NODE_ENV === 'production' ? '/dist' : '/src') +
                '/mail/templates',
              adapter: new HandlebarsAdapter(),
              options: {
                strict: true,
              },
            },
          };
        } catch (error) {
          Logger.error(error.message, error.stack, 'MailService');
          throw error;
        }
      },
    }),
  ],
  providers: [MailService, MailConfig],
  exports: [MailService, MailConfig],
})
export class MailModule {}
