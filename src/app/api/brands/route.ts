import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs' // ensures compatibility with request.formData()

const prisma = new PrismaClient()

// Set your Cloudinary credentials using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const brand = formData.get('brand')?.toString() || ''
    const contact = formData.get('contact')?.toString() || ''
    const email = formData.get('email')?.toString() || ''
    const phone = formData.get('phone')?.toString() || ''
    const website = formData.get('website')?.toString() || ''
    const logoFile = formData.get('logo') as File | null

    if (!brand || !contact || !email || !phone || !logoFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload logo to Cloudinary
    const arrayBuffer = await logoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadRes = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'confestival/brands' }, (error, result) => {
          if (error || !result) reject(error)
          else resolve({ secure_url: result.secure_url })
        })
        .end(buffer)
    })

    // Save to database
    await prisma.investor.create({
      data: {
        brand,
        contact,
        email,
        phone,
        website,
        logo: uploadRes.secure_url,
      },
    })

    // Send confirmation email
    const mailUser = process.env.MAIL_USER
    const mailPass = process.env.MAIL_PASS

    if (mailUser && mailPass) {
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
        text: `Congratulations!

        Your brand promotion reservation has been received.

        We'll reach out to you shortly for more details.

        Event Details:
        Date: 1st August, 2025
        Time: 3:30pm
        Venue: TI Francis auditorium, Federal University of Technology Akure, Ondo State, Nigeria.

        Best regards,  
        DeExclusives Music Organization team`,
        html:  `<h2>Music and Science Con-festival - Brand Promotion</h2>
    <p><strong>Congratulations!</strong></p>
    <p>Your brand promotion reservation has been received.</p>
    <p>We'll reach out to you shortly for more details.</p>

    <hr/>
    <h3>Event Details</h3>
    <p><strong>Date:</strong> 1st August, 2025</p>
    <p><strong>Time:</strong> 3:30 PM</p>
    <p><strong>Venue:</strong> TI Francis Auditorium,<br/>
       Federal University of Technology Akure,<br/>
       Ondo State, Nigeria.</p>

    <p>Best regards,<br/>
    <strong>DeExclusives Music Organization Team</strong></p>
  `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in brand POST route:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}