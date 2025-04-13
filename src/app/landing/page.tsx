"use client"
// import NoiseGradient from '@/components/noise-gradient'

import { useRef, useEffect } from "react";

// import Container from "../../components/container"
import Hero from "../../components/hero";
import Navbar from "../../components/navbar"


// Icons
// import { ArrowDownIcon, Menu, MessageSquareIcon } from "lucide-react";
// import { ArrowUpIcon, BarChart3Icon, Share2Icon } from "lucide-react";

// ShadComponents
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { UsersIcon } from "lucide-react";
// import {
//     ChartConfig,
//     ChartContainer,
//     ChartTooltip,
//     ChartTooltipContent,
// } from "@/components/ui/chart"

//
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
// import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
// import { ANALYTICS_DATA, RECENT_SALES } from "@/constants/dashboard";


function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mousePosition = useRef({ x: 0, y: 0 })
  const shaderProgramRef = useRef<WebGLProgram | null>(null)


  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize WebGL context
    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    })

    if (!gl) {
      console.error("WebGL not supported")
      return
    }

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX / canvas.width,
        y: 1.0 - e.clientY / canvas.height,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)


    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      varying highp vec2 vTextureCoord;
      void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `

    // Fragment shader program
    const fsSource = `
      precision highp float;
      varying highp vec2 vTextureCoord;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform bool uIsMouseDown;

      // Noise function (unchanged)
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main(void) {
        vec2 uv = vTextureCoord;
        vec2 mouseInfluence = uMouse;

        // Create gradient based on position and time
        float speed = 0.09;
        float noiseScale = 2.0;
        float noiseIntensity = 0.7;

        // Generate multiple layers of noise
        float noise1 = snoise(uv * noiseScale + uTime * speed) * noiseIntensity;
        float noise2 = snoise(uv * noiseScale * 2.0 - uTime * speed * 0.5) * noiseIntensity * 0.5;
        float noise = noise1 + noise2;

      // Create gradient colors
        // vec3 color1 = vec3(0.1, 0.1, 0.3); // Dark blue
        // vec3 color2 = vec3(0.6, 0.2, 0.7); // Purple
        // vec3 color3 = vec3(0.9, 0.4, 0.3); // Coral

        vec3 color1 = vec3(0.059, 0.090, 0.165); // Charcoal (#0F172A)
        vec3 color2 = vec3(0.118, 0.227, 0.541); // Indigo Blue (#1E3A8A)
        vec3 color3 = vec3(0.078, 0.722, 0.651); // Electric Teal (#14B8A6)

        // Mix colors based on position, noise, and mouse
        float distToMouse = distance(uv, mouseInfluence);
        float mouseEffect = smoothstep(0.5, 0.0, distToMouse) * 0.3; // Stronger mouse influence

        // Position-based gradient with noise distortion
        float posGradient = uv.y + uv.x * 0.2 + noise * 0.3 + mouseEffect;

        // Smooth transitions between colors
        vec3 finalColor;
        if (posGradient < 0.4) {
          finalColor = mix(color1, color2, smoothstep(0.0, 0.4, posGradient));
        } else {
          finalColor = mix(color2, color3, smoothstep(0.4, 1.0, posGradient));
        }

        // Add mouse-driven Green Apple accent
        vec3 greenApple = vec3(0.133, 0.773, 0.369); // Green Apple (#22C55E)
        finalColor += greenApple * mouseEffect * 0.5; // Green tint near mouse

        // Add subtle noise texture
        finalColor += noise * 0.05;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
    if (!shaderProgram) return

    shaderProgramRef.current = shaderProgram

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      },
      uniformLocations: {
        time: gl.getUniformLocation(shaderProgram, "uTime"),
        resolution: gl.getUniformLocation(shaderProgram, "uResolution"),
        mouse: gl.getUniformLocation(shaderProgram, "uMouse"),
        isMouseDown: gl.getUniformLocation(shaderProgram, "uIsMouseDown"),
      },
    }

    // Create buffers
    const buffers = initBuffers(gl)

    // Animation loop
    const startTime = Date.now()
    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000
      drawScene(gl, programInfo, buffers, currentTime)
      animationRef.current = requestAnimationFrame(render)
    }

    // Use the shader program - Moved outside drawScene to avoid conditional hook call
    if (shaderProgramRef.current) {
      gl.useProgram(shaderProgramRef.current)
    }

    render()

    // Initialize shader program
    function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

      if (!vertexShader || !fragmentShader) return null

      // Create the shader program
      const shaderProgram = gl.createProgram()
      if (!shaderProgram) return null

      gl.attachShader(shaderProgram, vertexShader)
      gl.attachShader(shaderProgram, fragmentShader)
      gl.linkProgram(shaderProgram)

      // Check if creating the shader program succeeded
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
        return null
      }

      return shaderProgram
    }

    // Load shader
    function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null

      // Send the source to the shader object
      gl.shaderSource(shader, source)

      // Compile the shader program
      gl.compileShader(shader)

      // Check if it compiled successfully
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    // Initialize buffers
    function initBuffers(gl: WebGLRenderingContext) {
      // Create a buffer for the square's positions
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

      // Create a square
      const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

      // Create texture coordinate buffer
      const textureCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)

      const textureCoordinates = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW)

      return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
      }
    }

    // Draw the scene
    function drawScene(
      gl: WebGLRenderingContext,
      programInfo: {
        program: WebGLProgram;
        attribLocations: { vertexPosition: number; textureCoord: number };
        uniformLocations: {
          time: WebGLUniformLocation | null;
          resolution: WebGLUniformLocation | null;
          mouse: WebGLUniformLocation | null;
          isMouseDown: WebGLUniformLocation | null;
        };
      },
      buffers: { position: WebGLBuffer | null; textureCoord: WebGLBuffer | null },
      time: number
    ) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Tell WebGL how to pull out the positions from the position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2, // 2 components per vertex
        gl.FLOAT,
        false,
        0,
        0,
      )
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)

      // Tell WebGL how to pull out the texture coordinates
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
      gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        2, // 2 components per vertex
        gl.FLOAT,
        false,
        0,
        0,
      )
      gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord)

      // Set the uniforms
      gl.uniform1f(programInfo.uniformLocations.time, time)
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height)
      gl.uniform2f(programInfo.uniformLocations.mouse, mousePosition.current.x, mousePosition.current.y)
      // gl.uniform1i(programInfo.uniformLocations.isMouseDown, isMouseDown.current ? 1 : 0)

      // Draw the square
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", setCanvasSize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
  <div>
    <div className="relative w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
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

export default Page