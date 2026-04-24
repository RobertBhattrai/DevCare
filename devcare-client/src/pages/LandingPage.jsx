import Footer from '../components/Footer'
import FeaturesSection from '../components/FeaturesSection'
import HeroSection from '../components/HeroSection'
import HowItWorksSection from '../components/HowItWorksSection'
import Navbar from '../components/Navbar'

function LandingPage() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />

        <section className="site-container pb-20" id="contact">
          <div className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center sm:px-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
              Hackathon Starter
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Build your AI healthcare demo faster
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
              This landing page is a clean base for your project. Keep the UI
              simple, focus on your AI workflow, and ship quickly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#home" className="btn-primary">
                Back to top
              </a>
              <a href="#features" className="btn-secondary">
                View sections
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage