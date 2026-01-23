<template>
  <div class="liquid-glass-effect">
    <canvas ref="canvasRef" class="gl-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let gl = null
let program = null
let uniforms = {}
let vao = null
let animationId = null

const mouse = { x: 0.5, y: 0.5 }
const targetMouse = { x: 0.5, y: 0.5 }
const smoothing = 0.08

const vertexShaderSource = `#version 300 es
precision mediump float;

in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

out vec2 vTextureCoord;

void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
}
`

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 vTextureCoord;

uniform vec2 uMousePos;
uniform vec2 uResolution;
uniform float uTime;
uniform float uRadius;

out vec4 fragColor;

const float PI = 3.14159265359;

mat2 rot(float a) { 
  float c = cos(a), s = sin(a); 
  return mat2(c, -s, s, c); 
}

float sdCircle(vec2 uv, float r) { 
  return length(uv) - r; 
}

vec3 getGradient(vec2 uv) {
  vec3 color1 = vec3(0.4, 0.6, 0.9);
  vec3 color2 = vec3(0.9, 0.4, 0.6);
  vec3 color3 = vec3(0.3, 0.8, 0.7);
  
  float t = uv.y + sin(uv.x * 3.0 + uTime * 0.5) * 0.1;
  vec3 color = mix(color1, color2, t);
  color = mix(color, color3, sin(uv.x * 2.0 + uTime * 0.3) * 0.5 + 0.5);
  
  return color;
}

float getDist(vec2 uv) {
  float sd = sdCircle(uv, uRadius);
  vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 mp = uMousePos * asp;
  float md = length(vTextureCoord * asp - mp);
  float fall = smoothstep(0.0, 0.8, md);
  float tweak = mix(0.02 / fall, 0.1 / fall, 2.5 * sd);
  tweak = min(-tweak, 0.0);
  return sd - tweak;
}

vec3 applyRefraction(float sd, vec2 st, vec2 originalUV) {
  vec2 offset = mix(vec2(0), normalize(st) / sd, length(st));
  float disp = 0.015;
  
  vec2 redUV = originalUV + offset * disp * 1.2;
  vec2 greenUV = originalUV + offset * disp * 1.0;
  vec2 blueUV = originalUV + offset * disp * 0.8;
  
  float r = getGradient(redUV).r;
  float g = getGradient(greenUV).g;
  float b = getGradient(blueUV).b;
  
  return vec3(r, g, b);
}

vec3 getEffect(vec2 st, vec2 originalUV) {
  float eps = 0.0005;
  vec3 sum = vec3(0.0);
  sum += applyRefraction(getDist(st), st, originalUV);
  sum += applyRefraction(getDist(st + vec2(eps, 0)), st + vec2(eps, 0), originalUV);
  sum += applyRefraction(getDist(st - vec2(eps, 0)), st - vec2(eps, 0), originalUV);
  sum += applyRefraction(getDist(st + vec2(0, eps)), st + vec2(0, eps), originalUV);
  sum += applyRefraction(getDist(st - vec2(0, eps)), st - vec2(0, eps), originalUV);
  return sum * 0.2;
}

void main() {
  vec2 uv = vTextureCoord;
  vec3 bg = getGradient(uv);
  
  vec2 st = uv - uMousePos;
  st *= vec2(uResolution.x / uResolution.y, 1.0);
  st *= 1.0 / 0.692;
  st = rot(-uTime * 0.3) * st;
  
  vec3 color = getEffect(st, uv);
  
  float sd = getDist(st);
  float op = smoothstep(0.0, 0.0025, -sd);
  color = mix(bg, color, op);
  
  // Add highlight
  float highlight = 1.0 - smoothstep(0.0, 0.3, length(st));
  color += highlight * 0.2;
  
  fragColor = vec4(color, 1.0);
}
`

function compileShader(source, type) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  
  return shader
}

function createProgram(vertexShader, fragmentShader) {
  const prog = gl.createProgram()
  gl.attachShader(prog, vertexShader)
  gl.attachShader(prog, fragmentShader)
  gl.linkProgram(prog)
  
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(prog))
    return null
  }
  
  return prog
}

function initWebGL() {
  const canvas = canvasRef.value
  gl = canvas.getContext('webgl2')
  
  if (!gl) {
    console.error('WebGL2 not supported')
    return
  }

  const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
  const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
  
  if (!vertexShader || !fragmentShader) return

  program = createProgram(vertexShader, fragmentShader)
  if (!program) return

  gl.useProgram(program)

  uniforms.uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix')
  uniforms.uPMatrix = gl.getUniformLocation(program, 'uPMatrix')
  uniforms.uMousePos = gl.getUniformLocation(program, 'uMousePos')
  uniforms.uResolution = gl.getUniformLocation(program, 'uResolution')
  uniforms.uTime = gl.getUniformLocation(program, 'uTime')
  uniforms.uRadius = gl.getUniformLocation(program, 'uRadius')

  const identityMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
  
  gl.uniformMatrix4fv(uniforms.uMVMatrix, false, identityMatrix)
  gl.uniformMatrix4fv(uniforms.uPMatrix, false, identityMatrix)

  setupGeometry()
  handleResize()
}

function setupGeometry() {
  const quad = new Float32Array([
    -1, -1, 0, 0, 0,
     1, -1, 0, 1, 0,
    -1,  1, 0, 0, 1,
     1,  1, 0, 1, 1
  ])

  vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

  const posLoc = gl.getAttribLocation(program, 'aVertexPosition')
  const uvLoc = gl.getAttribLocation(program, 'aTextureCoord')

  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 5 * 4, 0)

  gl.enableVertexAttribArray(uvLoc)
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 5 * 4, 3 * 4)
}

function handleResize() {
  if (!gl || !canvasRef.value) return
  
  const canvas = canvasRef.value
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  
  gl.viewport(0, 0, canvas.width, canvas.height)
}

function handleMouseMove(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  targetMouse.x = (event.clientX - rect.left) / rect.width
  targetMouse.y = 1 - (event.clientY - rect.top) / rect.height
}

let startTime = Date.now()

function render() {
  if (!gl || !program) return

  mouse.x += (targetMouse.x - mouse.x) * smoothing
  mouse.y += (targetMouse.y - mouse.y) * smoothing

  gl.clear(gl.COLOR_BUFFER_BIT)

  const time = (Date.now() - startTime) * 0.001
  
  gl.uniform2fv(uniforms.uResolution, [canvasRef.value.width, canvasRef.value.height])
  gl.uniform2fv(uniforms.uMousePos, [mouse.x, mouse.y])
  gl.uniform1f(uniforms.uTime, time)
  gl.uniform1f(uniforms.uRadius, 0.25)

  gl.bindVertexArray(vao)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  animationId = requestAnimationFrame(render)
}

onMounted(() => {
  try {
    initWebGL()
    window.addEventListener('resize', handleResize)
    canvasRef.value.addEventListener('mousemove', handleMouseMove)
    render()
  } catch (error) {
    console.error('WebGL initialization failed:', error)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style scoped>
.liquid-glass-effect {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  overflow: hidden;
  border-radius: 0 24px 24px 0;
}

.gl-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: none;
}
</style>
