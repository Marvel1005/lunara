import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Lunara',
  description: 'How Lunara collects, uses, protects, and deletes your data.',
};

export default function PrivacyPage() {
  return (
    <article className="space-y-8 text-sm leading-relaxed text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-fg">Last updated: October 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What we collect</h2>
        <p>
          Lunara is a private cycle and comfort-tracking app. We collect only what the
          app needs to work:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-fg">
          <li>Your email address and name (used to create your account and sign you in).</li>
          <li>
            The health information you choose to log: periods, pain, mood, sleep, water,
            energy, symptoms, cravings, journal entries, and preferences.
          </li>
          <li>
            Optional partner-connection details: your partner&apos;s email (sent only when
            you invite them) and the sharing permissions you explicitly enable.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">How your data is protected</h2>
        <p>
          Every piece of your data is access-controlled at the database level: no other
          user — including other Lunara accounts — can read your records. Your partner
          can see only the specific items you have toggled on, and only for as long as
          the connection is active. Sign-in codes are rate-limited and expire quickly.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Partner sharing is your choice</h2>
        <p>
          Partner sharing is off by default. Each category (pain, mood, sleep, water,
          energy, cycle status, comfort requests) is shared only if you enable it, you
          can change or revoke sharing at any time, and disconnecting immediately removes
          your partner&apos;s access. Permission changes are recorded in an audit log.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What we never do</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-fg">
          <li>We do not sell or rent your data.</li>
          <li>We do not use third-party advertising or tracking analytics.</li>
          <li>We do not use your health data for marketing.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Your rights</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-fg">
          <li>
            <strong>Export:</strong> you can download a complete JSON copy of your data
            from Settings at any time.
          </li>
          <li>
            <strong>Deletion:</strong> you can delete your account from Settings. This
            permanently removes your profile, all logged health data, and your partner
            connections. It cannot be undone.
          </li>
          <li>
            <strong>Access:</strong> everything Lunara stores about you is visible to you
            inside the app.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Children</h2>
        <p>
          Lunara is not directed at children under 13, and we do not knowingly collect
          data from them.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Changes & contact</h2>
        <p>
          If this policy changes in a meaningful way, we will note the update date above
          and surface a notice in the app. Questions about your data can be sent to the
          address on the Lunara domain owner&apos;s contact page.
        </p>
      </section>
    </article>
  );
}
