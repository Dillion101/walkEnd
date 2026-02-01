import { Card } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';


export default function CookiesPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-white mb-0">Cookie Policy</h1>
          </div>
          <p className="text-white">Last updated: February 1, 2026</p>
        </div>

        <Card className="p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. What Are Cookies?</h2>
            <p className="text-white leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit our website. They help us recognize you and understand how you use our site. Cookies are widely used to make websites work more efficiently and to provide useful information to the website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Cookies</h2>
            <p className="text-white leading-relaxed mb-3">We use cookies for the following purposes:</p>
            <ul className="space-y-2 text-white">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Authentication:</strong> To keep you logged in securely</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Performance:</strong> To analyze site usage and improve our services</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Preferences:</strong> To remember your settings and preferences</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Security:</strong> To detect and prevent fraudulent activities</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Essential Cookies</h3>
                <p className="text-white">
                  These are necessary for the website to function properly. They enable core functionality such as user authentication and account management.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Analytical Cookies</h3>
                <p className="text-white">
                  These help us understand how visitors interact with our website, allowing us to improve our services and user experience.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Functional Cookies</h3>
                <p className="text-white">
                  These remember your choices and preferences to provide a personalized experience when you return to our site.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Managing Cookies</h2>
            <p className="text-white leading-relaxed mb-3">
              You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when a cookie is being sent. Please note that blocking cookies may affect your ability to use certain features of our website.
            </p>
            <p className="text-white">
              To learn more about how to manage cookies, visit:
            </p>
            <ul className="space-y-2 text-gray-700 mt-2">
              <li>• <a href="https://support.google.com/chrome/answer/95647" className="text-orange-500 hover:underline">Google Chrome</a></li>
              <li>• <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-orange-500 hover:underline">Mozilla Firefox</a></li>
              <li>• <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-orange-500 hover:underline">Apple Safari</a></li>
              <li>• <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-orange-500 hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Third-Party Cookies</h2>
            <p className="text-white leading-relaxed">
              Our website may contain links to other websites and services. This policy applies only to WalkEnd WeekEnd. We are not responsible for the cookies or privacy practices of third-party websites.
            </p>
          </section>
        </Card>
      </div>
    </main>
    <Footer />
    </>
  );
}
