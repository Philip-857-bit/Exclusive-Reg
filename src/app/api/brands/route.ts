import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { IncomingForm, File } from 'formidable'
import { mkdir } from 'fs/promises'

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const form = new IncomingForm({ keepExtensions: true, multiples: false })

  const { fields, files }: { fields: Record<string, any>; files: Record<string, File | File[] | undefined> } = await new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })

  const { brand, contact, email, phone, website } = fields
  let logoFile = files.logo
  if (Array.isArray(logoFile)) {
    logoFile = logoFile[0]
  }

  if (!brand || !contact || !email || !phone || !logoFile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Ensure upload folder exists
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(logoFile.originalFilename || '.png')
    const logoFileName = `${Date.now()}-${brand}${ext}`.replace(/\s+/g, '_')
    const destPath = path.join(uploadDir, logoFileName)

    const fileBuffer = await readFile(logoFile.filepath)
    await writeFile(destPath, fileBuffer)

    const imageUrl = `/uploads/${logoFileName}`

    await prisma.investor.create({
      data: {
        // Replace 'brand' with the correct property name as per your Prisma schema, e.g., 'name'
        brand,
        contact,
        email,
        phone,
        website,
        logo: imageUrl,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}