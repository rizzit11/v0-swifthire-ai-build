import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { TrustedBy } from "@/components/marketing/trusted-by"
import { FeatureBento } from "@/components/marketing/feature-bento"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { CandidateFlow } from "@/components/marketing/candidate-flow"
import { HrFlow } from "@/components/marketing/hr-flow"
import { BiasExplainability } from "@/components/marketing/bias-explainability"
import { Pricing } from "@/components/marketing/pricing"
import { Testimonials } from "@/components/marketing/testimonials"
import { Footer } from "@/components/marketing/footer"

// Landing page — section order per Section 8.5 of the master spec:
// Navbar → Hero → Trusted-by → Feature bento → How it works →
// Candidate flow → HR flow → Bias/explainability → Pricing →
// Testimonials → Footer
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <TrustedBy />
        <FeatureBento />
        <HowItWorks />
        <CandidateFlow />
        <HrFlow />
        <BiasExplainability />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
