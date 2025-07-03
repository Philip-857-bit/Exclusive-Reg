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

    // Check for existing registration first
    const existing = await prisma.registration.findFirst({
      where: {
        email: email,
        name: name,
        phone: phone,
        company: ticket
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already registered.' },
        { status: 400 }
      )
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
        from: `DeExclusives Music Organization <${mailUser}>`,
        to: email,
        subject: 'DeExclusives Music Organization Event',
  text: `Music and Science Con-festival Reservation

Dear ${name},

Congratulations, we have reserved a seat for you with a ${ticket} ticket.

Event Details:
Date: 1st August, 2025
Time: 3:30pm
Venue: TI Francis Auditorium, Federal University of Technology Akure, Ondo State, Nigeria.

Best regards,
DeExclusives Music Organization team`,
        html: `
     <h2>Music and Science Con-festival Reservation</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p><strong>Congratulations</strong>, we have reserved a seat for you with a <strong>${ticket}</strong> ticket.</p>

    <hr/>
    <h3>Event Details</h3>
    <p><strong>Date:</strong> 1st August, 2025</p>
    <p><strong>Time:</strong> 3:30 PM</p>
    <p><strong>Venue:</strong> TI Francis Auditorium,<br/>
       Federal University of Technology Akure,<br/>
       Ondo State, Nigeria.</p>

    <p>Best regards,<br/>
    <strong>DeExclusives Music Organization team</strong></p>

  `,
        })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in attendee POST route:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}