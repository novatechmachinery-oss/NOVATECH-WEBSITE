import "server-only";

import net from "node:net";
import tls from "node:tls";

import type { ContactFormValues } from "@/lib/contactForm";
import { getSiteSettings } from "@/lib/site-settings.service";

type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
};

type SmtpMessage = {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function encodeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatAddress(name: string, email: string) {
  const cleanName = encodeHeader(name);
  const cleanEmail = email.trim();

  return cleanName ? `"${cleanName.replace(/"/g, '\\"')}" <${cleanEmail}>` : cleanEmail;
}

function dotStuff(value: string) {
  return value.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function buildEmailContent(values: ContactFormValues) {
  const name = [values.firstName, values.lastName].filter(Boolean).join(" ");
  const rows = [
    ["Name", name],
    ["Phone", values.phone],
    ["Email", values.email],
    ["Machine of Interest", values.machineInterest],
    ["Message", values.message],
  ];

  const text = [
    "New website enquiry received.",
    "",
    ...rows.flatMap(([label, value]) => [`${label}:`, value, ""]),
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid #dbe4ef;font-weight:700;color:#0f172a;width:180px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border:1px solid #dbe4ef;color:#334155;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
      <h2 style="margin:0 0 14px;color:#145b93;">New website enquiry received</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px;background:#ffffff;">
        ${htmlRows}
      </table>
    </div>`;

  return { name, text, html };
}

function createReader(socket: net.Socket) {
  let buffer = "";

  return async function readResponse() {
    return new Promise<string>((resolve, reject) => {
      const cleanup = () => {
        socket.off("data", handleData);
        socket.off("error", handleError);
      };

      const finishIfComplete = () => {
        const lines = buffer.split(/\r?\n/);
        const lastCompleteLine = lines.findLast((line) => /^\d{3} /.test(line));

        if (!lastCompleteLine) {
          return;
        }

        const response = lines.slice(0, lines.indexOf(lastCompleteLine) + 1).join("\n");
        buffer = lines.slice(lines.indexOf(lastCompleteLine) + 1).join("\n");
        cleanup();
        resolve(response);
      };

      const handleData = (chunk: Buffer) => {
        buffer += chunk.toString("utf8");
        finishIfComplete();
      };

      const handleError = (error: Error) => {
        cleanup();
        reject(error);
      };

      socket.on("data", handleData);
      socket.on("error", handleError);
      finishIfComplete();
    });
  };
}

async function expectResponse(readResponse: () => Promise<string>, expectedCode: string) {
  const response = await readResponse();

  if (!response.startsWith(expectedCode)) {
    throw new Error(`SMTP expected ${expectedCode}, received: ${response}`);
  }

  return response;
}

async function writeCommand(
  socket: net.Socket,
  readResponse: () => Promise<string>,
  command: string,
  expectedCode: string,
) {
  socket.write(`${command}\r\n`);
  return expectResponse(readResponse, expectedCode);
}

async function connectSmtp(config: SmtpConfig) {
  const socket = config.secure
    ? tls.connect({ host: config.host, port: config.port, servername: config.host })
    : net.connect({ host: config.host, port: config.port });

  socket.setTimeout(15000);

  await new Promise<void>((resolve, reject) => {
    if (config.secure) {
      socket.once("secureConnect", resolve);
    } else {
      socket.once("connect", resolve);
    }

    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out.")));
  });

  return socket;
}

async function sendSmtpEmail(config: SmtpConfig, message: SmtpMessage) {
  let socket = await connectSmtp(config);
  let readResponse = createReader(socket);
  const hostname = "novatechmachinery.com";

  try {
    await expectResponse(readResponse, "220");
    await writeCommand(socket, readResponse, `EHLO ${hostname}`, "250");

    if (!config.secure) {
      await writeCommand(socket, readResponse, "STARTTLS", "220");
      socket = tls.connect({ socket, servername: config.host });
      readResponse = createReader(socket);
      await new Promise<void>((resolve, reject) => {
        socket.once("secureConnect", resolve);
        socket.once("error", reject);
      });
      await writeCommand(socket, readResponse, `EHLO ${hostname}`, "250");
    }

    await writeCommand(socket, readResponse, "AUTH LOGIN", "334");
    await writeCommand(
      socket,
      readResponse,
      Buffer.from(config.username).toString("base64"),
      "334",
    );
    await writeCommand(
      socket,
      readResponse,
      Buffer.from(config.password).toString("base64"),
      "235",
    );
    await writeCommand(socket, readResponse, `MAIL FROM:<${config.fromEmail}>`, "250");
    await writeCommand(socket, readResponse, `RCPT TO:<${message.to}>`, "250");
    await writeCommand(socket, readResponse, "DATA", "354");

    const headers = [
      `From: ${formatAddress(config.fromName, config.fromEmail)}`,
      `To: ${message.to}`,
      `Reply-To: ${message.replyTo}`,
      `Subject: ${encodeHeader(message.subject)}`,
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="novatech-enquiry"',
      `Date: ${new Date().toUTCString()}`,
    ].join("\r\n");

    const body = [
      headers,
      "",
      "--novatech-enquiry",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      message.text,
      "",
      "--novatech-enquiry",
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      message.html,
      "",
      "--novatech-enquiry--",
    ].join("\r\n");

    socket.write(`${dotStuff(body)}\r\n.\r\n`);
    await expectResponse(readResponse, "250");
    socket.write("QUIT\r\n");
  } finally {
    socket.end();
  }
}

export async function sendContactEnquiryEmail(values: ContactFormValues) {
  const settings = await getSiteSettings();
  const smtp = settings.operations.smtp;
  const recipient = settings.contact.emailAddress.trim();
  const password = smtp.password.trim();
  const username = smtp.username.trim();
  const host = smtp.host.trim();
  const port = Number.parseInt(smtp.port, 10);

  if (!host || !Number.isFinite(port) || !username || !password || !recipient) {
    throw new Error("SMTP settings are incomplete. Configure SMTP host, port, username, and password.");
  }

  const { name, text, html } = buildEmailContent(values);

  await sendSmtpEmail(
    {
      host,
      port,
      username,
      password,
      fromEmail: smtp.fromEmail.trim() || username,
      fromName: smtp.fromName.trim() || "Novatech Machinery",
      secure: smtp.secure,
    },
    {
      to: recipient,
      replyTo: values.email,
      subject: `New enquiry from ${name || values.email}`,
      text,
      html,
    },
  );
}

export async function sendSmtpTestEmail(smtp: {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  testEmail: string;
}) {
  const recipient = smtp.testEmail.trim();
  const password = smtp.password.trim();
  const username = smtp.username.trim();
  const host = smtp.host.trim();
  const port = Number.parseInt(smtp.port, 10);
  const fromEmail = smtp.fromEmail.trim() || username;
  const fromName = smtp.fromName.trim() || "Novatech Machinery";

  if (!host || !Number.isFinite(port) || !username || !password || !recipient) {
    throw new Error("SMTP settings are incomplete. Add host, port, username, password, and test email.");
  }

  await sendSmtpEmail(
    {
      host,
      port,
      username,
      password,
      fromEmail,
      fromName,
      secure: smtp.secure,
    },
    {
      to: recipient,
      replyTo: fromEmail,
      subject: "Novatech SMTP test email",
      text: [
        "SMTP test successful.",
        "",
        "This message was sent from the Novatech admin panel to verify email delivery settings.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
          <h2 style="margin:0 0 12px;color:#145b93;">SMTP test successful</h2>
          <p style="margin:0;">This message was sent from the Novatech admin panel to verify email delivery settings.</p>
        </div>`,
    },
  );
}
