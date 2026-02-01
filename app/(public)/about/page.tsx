import Image from 'next/image'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="bg-black min-h-screen">
        <div className="space-y-16 pt-20">
      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center gap-3 justify-center mb-6">
            <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-0">About WalkEnd WeekEnd</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We believe running is more than just exercise – it's a community. Join us for weekly runs where fitness meets friendship.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-orange-500/10 py-16 border-y border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className='text-white'>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-4">
                To create an inclusive running community where people of all fitness levels can connect, motivate each other, and achieve their running goals together.
              </p>
              <p className="text-lg text-gray-300">
                Whether you're a seasoned marathon runner or just starting out, there's a place for you in our runs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg h-64 flex items-center justify-center">
              <span className="text-white text-4xl">🏃</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2 text-white">Community</h3>
              <p className="text-gray-400">
                We support each other, celebrate victories, and help through challenges together.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-2 text-white">Growth</h3>
              <p className="text-gray-400">
                Every run is an opportunity to improve, learn, and push your personal limits.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">😊</div>
              <h3 className="text-xl font-bold mb-2 text-white">Inclusivity</h3>
              <p className="text-gray-400">
                All paces, all levels, all backgrounds welcome. Running is for everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">Meet the Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg h-40 mb-4 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Team Member {i}</h3>
                  <p className="text-gray-400 mt-2">
                    Passion for running and community building. Always ready for the next adventure.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-16 rounded-lg mx-4 mb-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Run With Us?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join our community and be part of something special.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/join-run">
              <Button size="lg" className="bg-black hover:bg-gray-900 text-white">
                Join a Run
              </Button>
            </Link>
            <Link href="/event-calendar">
              <Button size="lg" className="bg-black hover:bg-gray-900 text-white">
                View Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>    </div>
    <Footer />
    </>  )
}
