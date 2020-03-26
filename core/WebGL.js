import glUtils from './webgl-utils.js'


export default class WebGL {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl')
    if(!this.gl) {
      throw new Error('WebGL not supported.')
    }
    console.log('canvas size', canvas.width, canvas.height)
    this.programs = {}
  }

  createProgram(name, vertexShader, fragmentShader, uniforms) {
    console.log('[WebGL] Creating program', name)
    const gl = this.gl
    const p = {}

    p.program = glUtils.createProgramFromSources(gl, [vertexShader, fragmentShader])
    p.texcoordLocation = gl.getAttribLocation(p.program, 'a_texCoord')

    p.texcoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, p.texcoordBuffer)
    this.setRectangle(gl, 0, 0, this.canvas.width, this.canvas.height)

    p.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, p.texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    p.texSizeLocation = gl.getUniformLocation(p.program, "u_texSize")
    p.uniforms = []
    for(const k in uniforms) {
      p.uniforms.push({
        name: k,
        location: gl.getUniformLocation(p.program, 
          `u_${typeof k == 'object' ? k+'[0]':k}`),
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

  render(image, name, options={}) {
    const p = this.programs[name]

    const gl = this.gl
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(p.program)

    gl.bindTexture(gl.TEXTURE_2D, p.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    gl.enableVertexAttribArray(p.positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, p.positionBuffer)
    gl.vertexAttribPointer(p.positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(p.texcoordLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, p.texcoordBuffer)
    gl.vertexAttribPointer(p.texcoordLocation, 2, gl.FLOAT, false, 0, 0)

    gl.uniform2f(p.texSizeLocation, gl.canvas.width, gl.canvas.height)
    for(const u of p.uniforms) {
      if(typeof(u.value) == 'object') {
        gl.uniform1fv(u.location, options[u.name] ? options[u.name] : u.value)
      } else {
        gl.uniform1f(u.location, options[u.name] ? options[u.name] : u.value)
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}

