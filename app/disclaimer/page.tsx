import { AlertTriangle } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Disclaimer</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-amber-900">Important Notice</p>
              <p className="text-amber-800 text-sm mt-1">
                Please read this disclaimer carefully before using Portfolio Tracker.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Not Financial Advice</h2>
            <p>
              <strong>THE CONTENT AND INFORMATION PROVIDED ON PORTFOLIO TRACKER IS FOR EDUCATIONAL
              AND INFORMATIONAL PURPOSES ONLY AND IS NOT INTENDED AS, AND SHALL NOT BE UNDERSTOOD
              OR CONSTRUED AS, FINANCIAL ADVICE.</strong>
            </p>
            <p>
              Portfolio Tracker does not provide personalized investment recommendations, tax advice,
              or legal advice. The Service does not take into account your personal financial situation,
              investment objectives, risk tolerance, or investment horizon.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. No Investment Recommendations</h2>
            <p>
              The Service does not recommend any specific securities, investment strategies, or
              trading decisions. Any target allocation percentages, rebalancing suggestions, or other
              portfolio insights provided by the Service are:
            </p>
            <ul>
              <li>Based solely on the data you input</li>
              <li>For informational purposes only</li>
              <li>Not recommendations to buy, sell, or hold any security</li>
              <li>Not tailored to your individual financial situation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Accuracy of Data</h2>
            <p>
              While we strive to provide accurate and up-to-date information, we make no warranties or
              representations regarding:
            </p>
            <ul>
              <li>The accuracy, reliability, or completeness of market data</li>
              <li>The timeliness of price updates (data may be delayed)</li>
              <li>The correctness of calculations or analytics</li>
            </ul>
            <p>
              Market data is provided by third parties (e.g., Yahoo Finance) and may be subject to
              errors, delays, or interruptions. We are not responsible for any actions taken based
              on this data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Investment Risks</h2>
            <p>
              ALL INVESTMENTS INVOLVE RISK, INCLUDING THE POSSIBLE LOSS OF PRINCIPAL. You should:
            </p>
            <ul>
              <li>Conduct your own research before making any investment decisions</li>
              <li>Consider consulting with a qualified financial advisor</li>
              <li>Carefully consider your investment objectives, risk tolerance, and financial situation</li>
              <li>Understand that past performance does not guarantee future results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. No Guarantee of Results</h2>
            <p>
              We do not guarantee that using the Service will result in profits or improved investment
              performance. Portfolio tracking, target allocation, and rebalancing strategies do not
              eliminate investment risk or guarantee against loss in declining markets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Your Responsibility</h2>
            <p>
              <strong>YOU ARE SOLELY RESPONSIBLE FOR:</strong>
            </p>
            <ul>
              <li>All investment decisions you make</li>
              <li>Verifying the accuracy of all portfolio data you enter</li>
              <li>Interpreting and acting upon any information provided by the Service</li>
              <li>The tax consequences of your investment decisions</li>
              <li>Compliance with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Hypothetical Data</h2>
            <p>
              Any examples, demo data, or portfolio displays shown in the Service are for illustrative
              purposes only and do not represent actual investments or past performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites (e.g., TradingView charts, Yahoo Finance).
              We are not responsible for the content or practices of these external sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
            <p>
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORTFOLIO TRACKER SHALL NOT BE LIABLE
              FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
              ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO
              INVESTMENT LOSSES.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Consult Professionals</h2>
            <p>
              We strongly recommend that you consult with:
            </p>
            <ul>
              <li>A qualified financial advisor before making investment decisions</li>
              <li>A tax professional regarding the tax implications of your investments</li>
              <li>A legal professional regarding any legal matters related to your investments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">11. Acknowledgment</h2>
            <p>
              By using Portfolio Tracker, you acknowledge that you have read, understood, and agree to
              this disclaimer. You understand that:
            </p>
            <ul>
              <li>The Service is not a substitute for professional financial advice</li>
              <li>All investment decisions are your sole responsibility</li>
              <li>You use the Service at your own risk</li>
            </ul>
          </section>

          <div className="bg-muted/50 border rounded-lg p-6 mt-8">
            <p className="font-semibold">
              If you do not agree with this disclaimer, do not use the Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
