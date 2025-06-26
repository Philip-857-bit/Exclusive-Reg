import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'
import { IncomingForm, File as FormidableFile, Fields, Files } from 'formidable'
import nodemailer from 'nodemailer'
import { Readable } from 'stream'
import { ReadableStream } from 'node:stream/web'

export const config = {
  api: { bodyParser: false },
}

const prisma = new PrismaClient()

// Utility to convert a web stream to Node stream
function webStreamToNode(stream: ReadableStream<Uint8Array>): Readable {
  const reader = stream.getReader()
  return new Readable({
    async read() {
      const { done, value } = await reader.read()
      this.push(done ? null : value)
    },
  })
}

// Define strong types
interface ParsedForm {
  fields: Fields
  files: Files
}

export async function POST(req: Request) {
  const form = new IncomingForm({ keepExtensions: true })

  const { fields, files }: ParsedForm = await new Promise((resolve, reject) => {
    const nodeStream = webStreamToNode(req.body as ReadableStream<Uint8Array>)
    // @ts-expect-error: suppress for pipe compatibility
    form.parse({ ...req, pipe: nodeStream.pipe.bind(nodeStream) }, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })

const brand = String(fields.brand)
const contact = String(fields.contact)
const email = String(fields.email)
const phone = String(fields.phone)
const website = String(fields.website)
  let logoFile = files.logo as FormidableFile | FormidableFile[] | undefined

  if (Array.isArray(logoFile)) logoFile = logoFile[0]
  if (!brand || !contact || !email || !phone || !logoFile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(logoFile.originalFilename || '.png')
    const logoFileName = `${Date.now()}-${brand}${ext}`.replace(/\s+/g, '_')
    const destPath = path.join(uploadDir, logoFileName)

    const fileBuffer = await readFile(logoFile.filepath)
    await writeFile(destPath, fileBuffer)

    const imageUrl = `/uploads/${logoFileName}`

    await prisma.investor.create({
      data: { brand, contact, email, phone, website, logo: imageUrl },
    })

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
      subject: 'Thanks for Promoting Your Brand',
      html: `<p>Hi ${contact},</p><p>Thank you for registering <strong>${brand}</strong> at StarCon 2025!</p>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}