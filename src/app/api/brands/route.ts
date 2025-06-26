import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { name, email, phone, ticket } = await req.json()

  if (!name || !email || !phone || !ticket) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const attendee = await prisma.registration.create({
    data: { name, email, phone, company: ticket },
  })

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `StarCon <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your StarCon 2025 Reservation',
      html: `<h3>Hello ${name},</h3><p>Thanks for reserving your <strong>${ticket}</strong> ticket. We look forward to seeing you!</p>`,
    })
  } catch (err) {
    console.error('Email error:', err)
  }

  return NextResponse.json({ success: true })
}