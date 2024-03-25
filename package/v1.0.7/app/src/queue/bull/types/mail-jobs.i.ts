export interface MailJob {
  email: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}
