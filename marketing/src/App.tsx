import { useEffect } from "react"
import { Nav } from "@/components/site/nav"
import { Hero } from "@/components/site/hero"
import { Marquee } from "@/components/site/marquee"
import { HowItWorks } from "@/components/site/how-it-works"
import { Integrations } from "@/components/site/integrations"
import { Pricing } from "@/components/site/pricing"
import { FinalCta } from "@/components/site/final-cta"
import { Footer } from "@/components/site/footer"
import { loadWidget, resolveWidgetConfig } from "@/lib/widget-loader"

export default function App() {
  // the site runs the real widget - the floating launcher is the product demo
  useEffect(() => {
    loadWidget(resolveWidgetConfig(import.meta.env))
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Integrations />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
