import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, phone, ticket } = await req.json()

    if (!name || !email || !phone || !ticket) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Save attendee to the database
    await prisma.registration.create({
      data: { name, email, phone, company: ticket },
    })

    // Check env vars
    const mailUser = process.env.MAIL_USER
    const mailPass = process.env.MAIL_PASS

    if (!mailUser || !mailPass) {
      console.warn('Missing MAIL_USER or MAIL_PASS in environment')
    } else {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: mailUser,
          pass: mailPass,
        },
      })

      await transporter.sendMail({
        from: `StarCon <${mailUser}>`,
        to: email,
        subject: 'Your StarCon 2025 Reservation',
        html: `<h3>Hello ${name},</h3>
               <p>Thanks for reserving your <strong>${ticket}</strong> ticket. We look forward to seeing you!</p>`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in attendee POST route:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}