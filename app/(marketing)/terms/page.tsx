import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use — Lunara',
  description: 'The terms that apply when you use Lunara.',
};

export default function TermsPage() {
  return (
    <article className="space-y-8 text-sm leading-relaxed text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
        <p className="text-xs text-muted-fg">Last updated: October 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. What Lunara is</h2>
        <p>
          Lunara is a personal wellness journal for tracking cycles, symptoms, and
          comfort — optionally shared with a partner you trust. Lunara is{' '}
          <strong>not a medical device</strong>, does not provide medical advice, and is
          not a substitute for a doctor, diagnosis, or treatment. Predictions are
          mathematical estimates from your own logs, not clinical forecasts.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. Your account</h2>
        <p>
          You need an email address to create an account, and you agree to set a password
          and keep it secret. You are responsible for activity under your account. One
          person per account — do not share credentials.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. Your data and your conduct</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-fg">
          <li>You own what you log. You can export or delete it at any time.</li>
          <li>
            Do not use Lunara to track or monitor another person without their consent.
            The partner features are built for voluntary, mutual support.
          </li>
          <li>Do not attempt to probe, scrape, or access data that is not yours.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Acceptable use</h2>
        <p>
          You may not misuse the service, interfere with its operation, attempt
          unauthorized access, or use Lunara for any unlawful purpose. We may suspend
          accounts that threaten the safety of other users or the service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Availability</h2>
        <p>
          Lunara is provided &quot;as is&quot;. We work to keep it reliable, but we do not
          guarantee uninterrupted availability. To the fullest extent permitted by law,
          we are not liable for indirect or consequential damages arising from your use
          of Lunara, including decisions made based on its predictions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. Changes</h2>
        <p>
          We may update these terms. Continuing to use Lunara after an update means you
          accept the revised terms. If you do not accept them, delete your account from
          Settings.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">7. Contact</h2>
        <p>
          Questions about these terms can be sent to the address on the Lunara domain
          owner&apos;s contact page.
        </p>
      </section>
    </article>
  );
}
