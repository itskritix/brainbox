import { Nav } from "@/components/site/nav"
import { Hero } from "@/components/site/hero"
import { Marquee } from "@/components/site/marquee"
import { Playground } from "@/components/site/playground"
import { HowItWorks } from "@/components/site/how-it-works"
import { Integrations } from "@/components/site/integrations"
import { Pricing } from "@/components/site/pricing"
import { FinalCta } from "@/components/site/final-cta"
import { Footer } from "@/components/site/footer"

export default function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Playground />
        <HowItWorks />
        <Integrations />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
