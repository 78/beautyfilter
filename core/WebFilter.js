import Emitter from 'events'
import WebGL from './WebGL.js'
import vertexShader from '~/shaders/vertex.glsl'
import identicalShader from '~/shaders/identical.glsl'
import grayScaleShader from '~/shaders/grayscale.glsl'
import bilateralShader from '~/shaders/bilateral.glsl'

export default class WebFilter extends WebGL {
  constructor(canvas) {
    super(canvas)
    
    this.createProgram("identical", vertexShader, identicalShader)
    this.createProgram("grayscale", vertexShader, grayScaleShader)

    const kernel = []
    const MSIZE = 15
    const kSize = (MSIZE-1)/2
    const normpdf = (x, sigma) =>
    {
      return 0.39894*Math.exp(-0.5*x*x/(sigma*sigma))/sigma
    }
    //create the 1-D kernel
    for (let j = 0; j <= kSize; ++j)
    {
      kernel[kSize+j] = kernel[kSize-j] = normpdf(j, 10.0)
    }
    this.createProgram("bilateral", vertexShader, bilateralShader, {
      kernel: kernel,
      sigma: 0.07
    })
  }


}

