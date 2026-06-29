import AboutHero from "../components/about/AboutHero";
import Mission from "../components/about/Mission";
import Values from "../components/about/Values";
import Story from "../components/about/Story";
import Stats from "../components/about/Stats";
import JoinCommunity from "../components/about/JoinCommunity";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Mission />
      <Values />
      <Story />
      <Stats />
      <JoinCommunity />
    </>
  );
}