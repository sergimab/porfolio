import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" || !message.trim()
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.CONTACT_EMAIL_TO;
  if (!to) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    const { error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} — portfolio`,
      html: `
        <p><strong>Nombre:</strong> ${escape(name)}</p>
        <p><strong>Email:</strong> ${escape(email)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escape(message).replace(/\n/g, "<br/>")}</p>
      `,
    });
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 502 });
  }
}
