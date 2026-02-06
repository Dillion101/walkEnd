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
      <section className="pt-12 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-wrap items-center gap-3 justify-center mb-6">
            <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-0">About WalkEnd WeekEnd</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            We believe running is more than just exercise – it's a community. Join us for weekly runs where fitness meets friendship.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-orange-500/10 py-12 sm:py-16 border-y border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className='text-white'>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-4">
                To create an inclusive running community where people of all fitness levels can connect, motivate each other, and achieve their running goals together.
              </p>
              <p className="text-base sm:text-lg text-gray-300">
                Whether you're a seasoned marathon runner or just starting out, there's a place for you in our runs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg h-64 overflow-hidden flex items-center justify-center">
              <Image
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=400&fit=crop"
                alt="Running together"
                width={500}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center text-white">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <CardContent className="pt-0">
              <div className="w-full h-48 bg-gray-800 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop"
                  alt="Community"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2 text-white">Community</h3>
                <p className="text-gray-400">
                  We support each other, celebrate victories, and help through challenges together.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <CardContent className="pt-0">
              <div className="w-full h-48 bg-gray-800 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300&h=300&fit=crop"
                  alt="Growth"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2 text-white">Growth</h3>
                <p className="text-gray-400">
                  Every run is an opportunity to improve, learn, and push your personal limits.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <CardContent className="pt-0">
              <div className="w-full h-48 bg-gray-800 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1491899185352-69a08b64b225?w=300&h=300&fit=crop"
                  alt="Inclusivity"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2 text-white">Inclusivity</h3>
                <p className="text-gray-400">
                  All paces, all levels, all backgrounds welcome. Running is for everyone.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-900 border-y border-gray-800 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center text-white">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { name: 'Coach Sarah', role: 'Founder & Lead Coach', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop' },
              { name: 'Alex Johnson', role: 'Community Manager', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' }
            ].map((member) => (
              <Card key={member.name} className="bg-gray-800 border-gray-700 overflow-hidden">
                <CardContent className="pt-0">
                  <div className="relative w-full h-64 bg-gray-700">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-orange-500 font-semibold mb-2">{member.role}</p>
                    <p className="text-gray-400">
                      Passionate about running and building a welcoming community. Always ready for the next adventure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-12 sm:py-16 rounded-lg mx-4 mb-12 sm:mb-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Run With Us?</h2>
          <p className="text-base sm:text-lg mb-8 opacity-90">
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
