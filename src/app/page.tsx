import Hero from "./components/home/Hero";
import HowItWorks from "./components/home/HowItWorks";
import PopularProcedures from "./components/home/PopularProcedures";
import CallToAction from "./components/home/CallToAction";
import ExploreClinicsSection from "./components/home/ExploreClinicsSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <PopularProcedures />
      <CallToAction />
      <ExploreClinicsSection />
    </>
  );
}