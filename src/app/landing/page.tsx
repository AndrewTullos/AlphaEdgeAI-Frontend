"use client"

import Hero from "../../components/hero";
import Navbar from "../../components/navbar"


function page() {

  return (
  <div>
      {/* <WebGLCanvas /> */}
    <div className="relative w-full h-screen overflow-hidden">
      <Navbar />
      <Hero />
      {/* <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-lg">AlphaEdgeAI</h1>
        <p className="mb-8 text-xl text-white text-center max-w-md drop-shadow-md">
        AlphaEdgeAI
        </p>
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <p className="text-white mb-4">Your Competitive Edge in the Market</p>
          <Button variant="outline" className="border-white text-black hover:bg-white/20 hover:text-white">
          Decode the Markets with AI Precision
          </Button>
        </Card>
      </div> */}
    </div>
  </div>
  )
}

export default page