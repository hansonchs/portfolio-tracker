export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
            <p>
              By accessing or using Portfolio Tracker ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p>
              Portfolio Tracker is a free service that allows you to:
            </p>
            <ul>
              <li>Manually track your stock and option positions</li>
              <li>Monitor cash balances across multiple broker accounts</li>
              <li>View real-time market prices and portfolio analytics</li>
              <li>Set target allocations and receive rebalancing recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
            <p>As a user of our Service, you agree to:</p>
            <ul>
              <li>Provide accurate and current information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be responsible for all activities that occur under your account</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Account Terms</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to notify us immediately of any unauthorized use of your account.
              We are not responsible for any loss or damage arising from your failure to comply with this obligation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Data Accuracy</h2>
            <p>
              <strong>Important:</strong> You are solely responsible for the accuracy of all portfolio data
              you enter into the Service. We do not verify or guarantee the accuracy of any information you provide.
            </p>
            <p>
              Market prices and other financial data are provided "as is" from third-party sources
              (Yahoo Finance) and may be delayed or inaccurate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Portfolio Tracker
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these
              Terms or for any other reason at our sole discretion. Upon termination, your right to use
              the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED,
              SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORTFOLIO TRACKER SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
              LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which the Service is operated, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of material
              changes via email or by posting a notice on our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through
              the provided channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
