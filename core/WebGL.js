// 
// https://webglfundamentals.org/
// 边学边用
// @xx
// 

import glUtils from './webgl-utils.js'


export default class WebGL {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl')
    if(!this.gl) {
      throw new Error('WebGL not supported.')
    }
    this.gl.viewport(0, 0, canvas.width, canvas.height)
    console.log('canvas size', canvas.width, canvas.height)
    this.programs = {}
    this.textures = []
    this.framebuffers = []
  }

  createProgram(name, vertexShader, fragmentShader, uniforms) {
    console.log('[WebGL] Creating program', name)
    const gl = this.gl
    const p = {}

    p.program = glUtils.createProgramFromSources(gl, [vertexShader, fragmentShader])
    p.positionLocation = gl.getAttribLocation(p.program, 'a_position')
    p.flipYLocation = gl.getUniformLocation(p.program, "u_flipY")

    p.positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, p.positionBuffer)
    this.setRectangle(gl, 0, 0, this.canvas.width, this.canvas.height)

    p.resolutionLocation = gl.getUniformLocation(p.program, "u_resolution")

    p.uniforms = []
    for(const k in uniforms) {
      p.uniforms.push({
        name: k,
        location: gl.getUniformLocation(p.program, 
          `u_${uniforms[k] instanceof Array ? k+'[0]':k}`),
        value: uniforms[k]
      })
    }
    this.programs[name] = p
  }

  setRectangle(gl, x, y, w, h) {
    const x1 = x, x2=x+w, y1=y, y2=y+h
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), gl.STATIC_DRAW)
  }

  activateFramebuffer(gl, index) {
    if(!this.framebuffers[index]) {
      this.framebuffers[index] = gl.createFramebuffer()
    }
    this.activateTexture(gl, index)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.height, 
      0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[index])
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
      gl.TEXTURE_2D, this.textures[index], 0)
    return this.framebuffers[index]
  }

  activateTexture(gl, index) {
    if(!this.textures[index]) {
      this.textures[index] = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, this.textures[index])
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    } else {
      gl.activeTexture(gl.TEXTURE0 + index)
    }
    return this.textures[index]
  }

  filter(options) {
    const name = options.name
    const p = this.programs[name]
    if(!p) {
      throw new Error("Unknown filter:" + name)
    }

    const gl = this.gl
    //gl.clearColor(0, 0, 0, 0)
    //gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(p.program)
    // 设置输入
    for(const input of options.inputs) {
      if(input.type == 'texture') {
        this.activateTexture(gl, input.index)
        const loc = gl.getUniformLocation(p.program, `u_${input.name}`)
        gl.uniform1i(loc, input.index)
        if(input.value) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input.value)
        }
      } else if (input.type == 'float') {
        const loc = gl.getUniformLocation(p.program, `u_${input.name}`)
        gl.uniform1f(loc, input.value)
      }
    }

    gl.uniform2f(p.resolutionLocation, gl.canvas.width, gl.canvas.height)
    for(const u of p.uniforms) {
      if(u.value instanceof Array) {
        gl.uniform1fv(u.location, options[u.name] ? options[u.name] : u.value)
      } else {
        gl.uniform1f(u.location, options[u.name] ? options[u.name] : u.value)
      }
    }
    // 设置顶点数据
    gl.enableVertexAttribArray(p.positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, p.positionBuffer)
    gl.vertexAttribPointer(p.positionLocation, 2, gl.FLOAT, false, 0, 0)


    // 设置输出
    if(options.output != null) {
      this.activateFramebuffer(gl, options.output)
      gl.uniform1f(p.flipYLocation, 1)
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.uniform1f(p.flipYLocation, -1)
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}

