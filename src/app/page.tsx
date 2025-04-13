import LandingPage from "./landing/page"
import NoiseGradient from "@/components/NoiseGradient";

export default function Home() {
  return (
    <>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <NoiseGradient />
        <LandingPage />
      </div>
    </>
  );
}
