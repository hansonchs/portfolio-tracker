export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account and use our Portfolio Tracker service:</p>
            <ul>
              <li><strong>Account Information:</strong> Your email address and name (provided via Clerk authentication)</li>
              <li><strong>Portfolio Data:</strong> Stocks, options, and cash positions you manually enter, including ticker symbols, quantities, costs, and account details</li>
              <li><strong>Settings:</strong> Your preferences for position thresholds and target allocations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve our portfolio tracking service</li>
              <li>Display your portfolio data and calculate insights</li>
              <li>Fetch real-time market prices from public APIs (Yahoo Finance)</li>
              <li>Send you service-related communications (if you opt-in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Data Storage & Security</h2>
            <p>
              Your data is stored securely in our database and is protected using industry-standard encryption.
              We use Clerk for authentication, which handles your credentials securely.
            </p>
            <p><strong>Important:</strong> We never store your brokerage credentials or passwords. All position data is manually entered by you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data only:</p>
            <ul>
              <li><strong>With your consent:</strong> When you explicitly authorize us to do so</li>
              <li><strong>For service providers:</strong> With trusted third parties who assist us in operating our service (e.g., Clerk for authentication, database hosting providers)</li>
              <li><strong>Legal requirements:</strong> To comply with legal obligations or protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Clerk:</strong> For user authentication and account management</li>
              <li><strong>Yahoo Finance:</strong> For fetching real-time stock and option prices</li>
              <li><strong>Database Hosting:</strong> For secure data storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Correction:</strong> Update or correct your personal information</li>
              <li><strong>Export:</strong> Export your portfolio data at any time</li>
            </ul>
            <p>To exercise these rights, please contact us at the information provided below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. Upon account deletion,
              all your personal data and portfolio information will be permanently deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 16 years of age. We do not knowingly
              collect personal information from children under 16.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
