import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { AboutProject } from "@/components/landing/about-project";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <AboutProject />
      <HowItWorks />
      <Footer />
    </main>
  );
}
