import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="success-page">
      <section className="success-card">
        <Link className="wordmark" href="/" aria-label="Akbar Nur Rizqi home">
          ANR<span>.</span>
        </Link>
        <p className="eyebrow">MESSAGE / RECEIVED</p>
        <h1>Thank you for reaching out.</h1>
        <p>
          Your message has been submitted successfully. I will get back to you
          as soon as possible.
        </p>
        <Link className="button button-primary" href="/">
          Return to portfolio <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
