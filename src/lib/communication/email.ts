'use server'
import { z } from "zod";
import nodemailer from "nodemailer";
import { getDBUserFromServer } from "../firebase/server";

const emailConfig = {
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error("Email configuration missing");
    }
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
};

export async function sendMail (
  to: string | string[],
  subject: string,
  html: string
) {
  const notificationPromises = [getTransporter().sendMail({
    from: `"Smart Enroll" <${emailConfig.auth.user}>`,
    to,
    subject,
    html,
  })]
  await Promise.race([
    Promise.all(notificationPromises),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Notification timeout")), 50000)
    ),
  ]);
  return true;
};

export async function sendMailViaUID(uid: string, subject: string, html: string) {
  // Get the organization creator's email
  const creator = await getDBUserFromServer(uid);
  const creatorEmail = creator?.email;
  if (!creatorEmail) {
    return
  } 
  return sendMail(creatorEmail, subject, html);
};