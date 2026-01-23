<template>
  <div class="card-liquid-effect" v-show="isVisible">
    <canvas ref="canvasRef" class="liquid-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const canvasRef = ref(null)
let gl = null
let program = null
let uniforms = {}
let vao = null
let animationId = null

const mouse = { x: 0.5, y: 0.5 }
const targetMouse = { x: 0.5, y: 0.5 }

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
out vec2 vTextureCoord;

void main() {
  gl_Position = vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
}
`

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec2 vTextureCoord;
uniform vec2 uMousePos;
uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;

float sdCircle(vec2 uv, float r) { 
  return length(uv) - r; 
}

void main() {
  vec2 uv = vTextureCoord;
  vec2 st = uv - uMousePos;
  st *= vec2(uResolution.x / uResolution.y, 1.0);
  
  float dist = sdCircle(st, 0.15);
  float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
  ripple *= smoothstep(0.3, 0.0, dist);
  
  vec3 color = vec3(0.4, 0.6, 0.9) * ripple;
  fragColor = vec4(color, ripple * 0.6);
}
`

function compileShader(source, type) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

function initWebGL() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false })
  if (!gl) return

  const vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
  const fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
  if (!vs || !fs) return

  program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

  gl.useProgram(program)
  
  uniforms.uMousePos = gl.getUniformLocation(program, 'uMousePos')
  uniforms.uResolution = gl.getUniformLocation(program, 'uResolution')
  uniforms.uTime = gl.getUniformLocation(program, 'uTime')

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
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 20, 0)
  gl.enableVertexAttribArray(uvLoc)
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12)
  
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  
  handleResize()
}

function handleResize() {
  if (!gl || !canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  gl.viewport(0, 0, canvas.width, canvas.height)
}

function handleMouseMove(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  targetMouse.x = (event.clientX - rect.left) / rect.width
  targetMouse.y = 1 - (event.clientY - rect.top) / rect.height
}

let startTime = Date.now()

function render() {
  if (!gl || !program || !props.isVisible) {
    animationId = requestAnimationFrame(render)
    return
  }

  mouse.x += (targetMouse.x - mouse.x) * 0.15
  mouse.y += (targetMouse.y - mouse.y) * 0.15

  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const time = (Date.now() - startTime) * 0.001
  
  gl.uniform2fv(uniforms.uResolution, [canvasRef.value.width, canvasRef.value.height])
  gl.uniform2fv(uniforms.uMousePos, [mouse.x, mouse.y])
  gl.uniform1f(uniforms.uTime, time)

  gl.bindVertexArray(vao)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  animationId = requestAnimationFrame(render)
}

watch(() => props.isVisible, (newVal) => {
  if (newVal && !animationId) {
    render()
  }
})

onMounted(() => {
  try {
    initWebGL()
    window.addEventListener('resize', handleResize)
    if (canvasRef.value) {
      canvasRef.value.addEventListener('mousemove', handleMouseMove)
    }
    if (props.isVisible) {
      render()
    }
  } catch (error) {
    console.error('WebGL init failed:', error)
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
.card-liquid-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.liquid-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
