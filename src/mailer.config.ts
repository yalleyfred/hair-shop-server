import * as fs from 'fs';
import * as path from 'path';
import * as tls from 'tls';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type MailTransportOptions = SMTPTransport.Options & {
  pool?: boolean;
  maxConnections?: number;
  maxMessages?: number;
};

const toBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (typeof value !== 'string') {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return defaultValue;
};

export const getMailTransport = (): MailTransportOptions => {
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  return getMailTransportWithPort(smtpPort);
};

export const getMailTransportWithPort = (port: number): MailTransportOptions => {
  const smtpPort = port;
  const smtpSecure = toBool(process.env.SMTP_SECURE, smtpPort === 465);

  return {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: smtpPort,
    pool: toBool(process.env.SMTP_POOL, true),
    maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5', 10),
    maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES || '100', 10),
    secure: smtpSecure,
    requireTLS: toBool(process.env.SMTP_REQUIRE_TLS, !smtpSecure),
    connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '20000', 10),
    greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '20000', 10),
    socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '30000', 10),
    tls: {
      rejectUnauthorized: toBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true),
      minVersion: (process.env.SMTP_TLS_MIN_VERSION || 'TLSv1.2') as tls.SecureVersion,
    },
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  };
};

export const getSmtpRetryAttempts = (): number =>
  Math.max(0, parseInt(process.env.SMTP_RETRY_ATTEMPTS || '1', 10));

export const getSmtpFallbackPort = (): number | null => {
  const value = process.env.SMTP_FALLBACK_PORT;
  if (!value) {
    return null;
  }
  const port = parseInt(value, 10);
  return Number.isFinite(port) ? port : null;
};

export const getDefaultFrom = (): string => process.env.EMAIL_FROM || 'noreply@example.com';

export const getTemplatePath = (templateName: string): string => {
  const candidates = [
    path.join(process.cwd(), 'src', 'templates', `${templateName}.pug`),
    path.join(process.cwd(), 'dist', 'templates', `${templateName}.pug`),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
};
