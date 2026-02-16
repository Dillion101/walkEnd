import Image from 'next/image'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="bg-background min-h-screen">
        {/* Hero Section with Large Typography */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Large Typography */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <Image
                    src="/icon.svg"
                    alt="WalkEnd WeekEnd"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                  <span className="text-sm font-medium tracking-widest uppercase text-accent">About Us</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  Running is
                  <br />
                  <span className="text-accent">community</span>
                </h1>
                
                <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                  We believe running is more than just exercise. It's about connection, growth, and pushing boundaries together. Every stride brings us closer as a community.
                </p>
              </div>

              {/* Right: Featured Image */}
              <div className="relative">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                  <Image
                    src="/IMG_0399.jpg"
                    alt="Running together"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
                {/* Accent decoration */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement - Full Width */}
        <section className="py-20 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 leading-tight">
                Our mission is to create an inclusive space where runners of all levels connect, motivate, and grow together.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Whether you're training for your first 5K or your tenth marathon, there's a place for you here. We meet every weekend to run, share stories, and build lasting friendships.
              </p>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-16">What drives us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Community */}
              <div className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl mb-6">
                  <Image
                    src="/IMG_0394.jpg"
                    alt="Community"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Community</h3>
                <p className="text-gray-400 leading-relaxed">
                  We support each other through every mile. Celebrate victories together and help each other through challenges.
                </p>
              </div>

              {/* Growth */}
              <div className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl mb-6">
                  <Image
                    src="/IMG_0384.jpg"
                    alt="Growth"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Growth</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every run is an opportunity to improve, learn something new, and push your personal limits further.
                </p>
              </div>

              {/* Inclusivity */}
              <div className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl mb-6">
                  <Image
                    src="/IMG_0387.jpg"
                    alt="Inclusivity"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3">Inclusivity</h3>
                <p className="text-gray-400 leading-relaxed">
                  All paces, all levels, all backgrounds welcome. Running is for everyone, and everyone belongs here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet the team</h2>
              <p className="text-xl text-gray-400">The people making it all happen</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Coach Yaw */}
              <div className="group">
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl mb-6">
                  <Image
                    src="/IMG_0383.jpg"
                    alt="Coach Yaw Bekoe"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Coach Yaw Bekoe</h3>
                  <p className="text-accent font-medium">Founder & Lead Coach</p>
                  <p className="text-gray-400 leading-relaxed">
                    Passionate about building community through running. With years of coaching experience, Yaw believes in meeting every runner where they are and helping them discover their potential.
                  </p>
                </div>
              </div>

              {/* Bernard */}
              <div className="group">
                <div className="relative aspect-3/4 overflow-hidden rounded-2xl mb-6">
                  <Image
                    src="/IMG_0391.jpg"
                    alt="Bernard Bright Boffah"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Bernard Bright Boffah</h3>
                  <p className="text-accent font-medium">Group Manager</p>
                  <p className="text-gray-400 leading-relaxed">
                    Keeps everything running smoothly behind the scenes. Bernard's organizational skills and genuine care for the community ensure every run is well-coordinated and welcoming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-accent p-12 sm:p-16 lg:p-20">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative max-w-3xl">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-background">
                  Ready to run with us?
                </h2>
                <p className="text-xl text-background/80 mb-8 leading-relaxed">
                  Join our community and be part of something special. Every Sunday, rain or shine, we're out there together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/join-run" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="bg-background text-accent hover:bg-background/90 font-semibold w-full h-14 px-8 text-base"
                    >
                      Join a Run
                    </Button>
                  </Link>
                  <Link href="/event-calendar" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-accent font-semibold w-full h-14 px-8 text-base transition-all"
                    >
                      View Events
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}