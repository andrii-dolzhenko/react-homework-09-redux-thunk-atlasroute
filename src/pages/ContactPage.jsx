import { useState } from 'react'
import Lottie from 'lottie-react'
import { Link } from 'react-router'
import contactRouteAnimation from '../assets/contact-route.json'

const topics = [
  'Destination suggestion',
  'Data issue',
  'Technical issue',
  'Project feedback',
  'Other',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    event.currentTarget.reset()
    setSubmitted(true)
  }

  return (
    <section className="shell contact-page">
      <div className="contact-hero">
        <div className="contact-hero__copy">
          <p className="eyebrow">Get in touch</p>
          <h1>Let’s keep<br />the route going.</h1>
          <p>
            Have a destination suggestion, found something that needs attention,
            or want to talk about AtlasRoute? Send a message.
          </p>
        </div>

        <div className="contact-hero__animation" aria-hidden="true">
          <Lottie
            animationData={contactRouteAnimation}
            loop
            autoplay
            className="contact-hero__lottie"
          />
        </div>
      </div>

      <div className="contact-grid">
        <div className="contact-reasons">
          <h2>What can we talk about?</h2>

          <article>
            <span>01</span>
            <div>
              <strong>Suggest a destination</strong>
              <p>Recommend a country, place or route worth exploring.</p>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <strong>Report an issue</strong>
              <p>Found incorrect country information or something that does not work as expected?</p>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <strong>Project feedback</strong>
              <p>Share an idea that could make AtlasRoute clearer or more useful.</p>
            </div>
          </article>
        </div>

        <form
          className="contact-form"
          onSubmit={handleSubmit}
          onChange={() => submitted && setSubmitted(false)}
        >
          <div className="contact-field">
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your name" required />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-topic">Topic</label>
            <div className="contact-select">
              <select id="contact-topic" name="topic" defaultValue={topics[0]}>
                {topics.map((topic) => <option key={topic}>{topic}</option>)}
              </select>
              <span className="contact-select__button" aria-hidden="true"></span>
            </div>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="6"
              placeholder="Tell us what is on your mind..."
              required
            />
          </div>

          <button className="primary-button contact-submit" type="submit">Send message <span>→</span></button>

          <p className="contact-success" role="status" aria-live="polite">
            {submitted ? 'Message received. Thanks for helping AtlasRoute go further.' : ''}
          </p>
        </form>
      </div>

      <div className="contact-explore">
        <div>
          <span>Prefer exploring instead?</span>
          <strong>Continue discovering countries and routes.</strong>
        </div>
        <Link className="text-link contact-explore__link" to="/countries">Browse countries →</Link>
      </div>
    </section>
  )
}
