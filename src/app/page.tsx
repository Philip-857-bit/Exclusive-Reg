'use client'

import { useEffect, useState } from 'react'
import './globals.css'
import {
  FaTwitter,
  FaFacebook,
  FaYoutube,
} from 'react-icons/fa'
import Image from 'next/image'

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const eventDate = new Date('2025-08-01T09:00:00Z')
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = eventDate.getTime() - now
      if (distance < 0) {
        setTimeLeft('Event started!')
        return
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleForm = async (
  e: React.FormEvent<HTMLFormElement>,
  type: 'attendee' | 'brand'
) => {
  e.preventDefault()
  const form = e.currentTarget

  try {
    if (type === 'attendee') {
      // Send JSON
      const formData = Object.fromEntries(new FormData(form).entries())
      await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
    } else {
      // Send FormData (for file upload)
      const formData = new FormData(form)
      await fetch('/api/brands', {
        method: 'POST',
        body: formData,
      })
    }

    alert('Reservation confirmed! Check your email for more details.')
    form.reset()
  } catch (err) {
    console.error('Form submission error:', err)
    alert('Submission failed. Please try again.')
  }
}

  return (
    <main>
      <section className="hero">
        <h2>Dexclusive Music Organisation</h2>
        <h1>Music & Science Con-Festival</h1>
        <h2>Theme: Fluidity Chain of Interaction: Future of Africa</h2>
        <p>August 1, 2025</p>
        <p>
          Starts in: <strong>{timeLeft}</strong>
        </p>
        <div className="cta-buttons">
          <a href="#attend">
            <button>Reserve Spot</button>
          </a>
          <a href="#sponsor">
            <button>Promote Your Brand</button>
          </a>
        </div>
      </section>

      <section className="about">
        <h2>About the Event</h2>
        <p>
          Join us for the ultimate con-festival where music meets science!
          Experience a unique blend of performances, workshops, and exhibitions
          that explore the future of Africa through the lens of innovation and
          creativity.
        </p>
      </section>

      <section className="expect">
        <h2>What to Expect</h2>
        <p>Panels, Workshops, Performances, Exhibitions and more!</p>
      </section>

      <section id="attend" className="form-section">
        <h2>Register for Free</h2>
        <form
          onSubmit={(e) => handleForm(e, 'attendee')}
          className="form"
          encType="multipart/form-data"
        >
          <input name="name" placeholder="Full Name" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="tel" name="phone" placeholder="Phone" required />
          <select name="ticket">
            <option value="free">Student</option>
            <option value="student">Entrepreneur</option>
            <option value="vip">Staff</option>
          </select>
          <button type="submit">Confirm Reservation</button>
        </form>
      </section>

      <section id="sponsor" className="form-section">
        <h2>Promote Your Brand</h2>
        <form
          onSubmit={(e) => handleForm(e, 'brand')}
          className="form"
          encType="multipart/form-data"
        >
          <input name="brand" placeholder="Brand Name" required />
          <input name="contact" placeholder="Contact Person" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="phone" type="tel" placeholder="Phone" required />
          <input name="website" placeholder="Website or Social Link" required />
          <input
            name="logo"
            type="file"
            placeholder="Upload Logo"
            accept="image/*"
            required
          />
          <button type="submit">Promote Your Brand</button>
        </form>
      </section>

      <section className="Join">
        <h2>Join the Movement</h2>
        <p>
          Be part of a transformative experience that celebrates the
          intersection of music and science. Connect with like-minded
          individuals, industry leaders, and innovators.
        </p>
        <div className="join-button">
          <a href="https://chat.whatsapp.com/DjJFwXaZnrC33e8UhUgxcA">
            <button>Join Now</button>
          </a>
        </div>
      </section>

      <section className="contact">
        <h2>Contact Us</h2>
        <p>📍 Venue: Landmark Centre, Lagos</p>
        <iframe
          src="https://maps.google.com/maps?q=Landmark%20Centre%20Lagos&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
        ></iframe>
        <p>📞 +234 807 105 5742</p>
        <p>📞 +234 702 555 9094</p>
        <p>
          <a href="mailto:exclusivemusicorganization@gmail.com">
            📧 exclusivemusicorganization@gmail.com
          </a>
        </p>
        <a
        href="https://wa.me/2348071055742"><button>Contact Organizers</button></a>
        <p>
          For more info,{' '}
          <a href="mailto:exclusivemusicorganization@gmail.com">email us</a> or
          call the number above.
        </p>
        <h2>Follow Us</h2>
        <div className="socials">
          <a href="https://x.com/exclusive96708" target="_blank">
            <FaTwitter />
          </a>
          <a href="https://www.youtube.com/@exclusivemusic4311" target="_blank">
            <FaYoutube />
          </a>
          <a href="https://www.facebook.com/share/19LffiXWq5/" target="_blank">
            <FaFacebook />
          </a>
        </div>
      </section>
      <a
        href="https://wa.me/2348071055742"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="https://cdn-icons-png.flaticon.com/512/124/124034.png"
          alt="WhatsApp Chat"
          width={50}
          height={50}
          unoptimized
        />
      </a>
    </main>
  )
}