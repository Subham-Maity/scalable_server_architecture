import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { google } from 'googleapis';
import { Mail0AuthService } from './mail0Auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailConfig } from './config/mail.config';
/**For zero auth setup Read This Steps Carefully:
 * https://github.com/Subham-Maity/fullstack_advance/blob/main/README/0AuthSetps.md */
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mailConfig = new MailConfig(configService);
        const oAuth2Client = new google.auth.OAuth2(
          mailConfig.oauthGmailSenderClientId,
          mailConfig.oauthGmailSenderClientSecret,
          mailConfig.oauthGmailSenderRedirectUri,
        );
        oAuth2Client.setCredentials({
          refresh_token: mailConfig.oauthGmailSenderRefreshToken,
        });
        const accessToken = await oAuth2Client.getAccessToken();
        return {
          transport: {
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: mailConfig.senderGmailAddress,
              clientId: mailConfig.oauthGmailSenderClientId,
              clientSecret: mailConfig.oauthGmailSenderClientSecret,
              refreshToken: mailConfig.oauthGmailSenderRefreshToken,
              accessToken: accessToken.token,
            },
          },
          defaults: {
            from: mailConfig.senderGmailAddress,
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
      },
    }),
  ],
  providers: [Mail0AuthService, MailConfig],
  exports: [Mail0AuthService, MailConfig],
})
export class Mail0AuthModule {}
