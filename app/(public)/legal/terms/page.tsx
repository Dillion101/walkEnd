import { Card } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';

export default function TermsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-white mb-0">Terms and Conditions</h1>
          </div>
          <p className="text-white">Last updated: February 1, 2026</p>
        </div>

        <Card className="p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
            <p className="text-white leading-relaxed">
              By accessing and using the WalkEnd WeekEnd website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Use License</h2>
            <p className="text-white leading-relaxed mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on WalkEnd WeekEnd for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-white">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span>Modifying or copying the materials.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span>Using the materials for any commercial purpose or for any public display.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span>Attempting to decompile or reverse engineer any software contained on the site.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span>Removing any copyright or other proprietary notations from the materials.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">•</span>
                <span>Transferring the materials to another person or "mirroring" the materials on any other server.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Disclaimer</h2>
            <p className="text-white leading-relaxed">
              The materials on WalkEnd WeekEnd are provided on an 'as is' basis. WalkEnd WeekEnd makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Limitations</h2>
            <p className="text-white leading-relaxed">
              In no event shall WalkEnd WeekEnd or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WalkEnd WeekEnd, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Accuracy of Materials</h2>
            <p className="text-white leading-relaxed">
              The materials appearing on WalkEnd WeekEnd could include technical, typographical, or photographic errors. WalkEnd WeekEnd does not warrant that any of the materials on our website are accurate, complete, or current. WalkEnd WeekEnd may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Links</h2>
            <p className="text-white leading-relaxed">
              WalkEnd WeekEnd has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by WalkEnd WeekEnd of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Modifications</h2>
            <p className="text-white leading-relaxed">
              WalkEnd WeekEnd may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Governing Law</h2>
            <p className="text-white leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of Ghana, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. User Accounts</h2>
            <p className="text-white leading-relaxed mb-3">
              If you create an account on our website, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. Event Participation</h2>
            <p className="text-white leading-relaxed">
              By registering for events through WalkEnd WeekEnd, you acknowledge that you are physically capable of participating in running events. You assume all risks associated with participation, including but not limited to injury, illness, or property damage.
            </p>
          </section>
        </Card>
      </div>
    </main>
    <Footer />
    </>
  );
}
