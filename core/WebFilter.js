/* 
 * https://github.com/YuAo/YUCIHighPassSkinSmoothing
 * 
 */

import Emitter from 'events'
import WebGL from './WebGL.js'
import vertexShader from '~/shaders/vertex.glsl'
import identicalShader from '~/shaders/identical.glsl'
import grayScaleShader from '~/shaders/grayscale.glsl'
import bilateralShader from '~/shaders/bilateral.glsl'
import gboverlayShader from '~/shaders/gboverlay.glsl'
import gaussianblurShader from '~/shaders/gaussianblur.glsl'
import highpassShader from '~/shaders/highpass.glsl'
import hardlightShader from '~/shaders/hardlight.glsl'
import tonecurveShader from '~/shaders/tonecurve.glsl'
import blendShader from '~/shaders/blend.glsl'
import exposureShader from '~/shaders/exposure.glsl'
import sharpenShader from '~/shaders/sharpen.glsl'

export default class WebFilter extends WebGL {
  constructor(canvas) {
    super(canvas)
    
    this.createProgram("identical", vertexShader, identicalShader)
    this.createProgram("grayscale", vertexShader, grayScaleShader)
    this.createProgram("gboverlay", vertexShader, gboverlayShader)
    this.createProgram("highpass", vertexShader, highpassShader)
    this.createProgram("hardlight", vertexShader, hardlightShader)
    this.createProgram("tonecurve", vertexShader, tonecurveShader)
    this.createProgram("blend", vertexShader, blendShader)
    this.createProgram("exposure", vertexShader, exposureShader)
    this.createProgram("sharpen", vertexShader, sharpenShader)

    this.initBilateralBlur()
    this.initGaussianBlur()
  }

  initGaussianBlur() {
    const kernel = []
    const MSIZE = 9
    const kSize = (MSIZE-1)/2
    const normpdf = (x, sigma) =>
    {
      return 0.39894*Math.exp(-0.5*x*x/(sigma*sigma))/sigma
    }
    //create the 1-D kernel
    for (let j = 0; j <= kSize; ++j)
    {
      kernel[kSize+j] = kernel[kSize-j] = normpdf(j, 7.0)
    }
    let Z = 0.
    //get the normalization factor (as the gaussian has been clamped)
    for (let j = 0; j < MSIZE; ++j)
    {
      Z += kernel[j]
    }
    this.createProgram("gaussianblur", vertexShader, gaussianblurShader, {
      kernel: kernel,
      kernel_sumsqrt: Z*Z
    })
  }

  initBilateralBlur() {
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

  copy(image) {
    this.filter({
      name: 'identical',
      inputs: [
        {name: 'image', type: 'texture', value: image, index: 0},
      ],
      output: null
    })
  }

  beautify(image, options = {}) {
    // 从image到texture的步骤是最慢的，大概需要～30ms，
    // 所以缓存到Texture0
    // marked by xx
    if(!options.level) {
      options.level = 0.5
    }
    const level = Math.max(0.0, Math.min(options.level, 1.0))

    let t = new Date()
    const times = []
    this.filter({
      name: 'identical',
      inputs: [
        {name: 'image', type: 'texture', value: image, index: 1}
      ],
      output: 0
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'exposure',
      inputs: [
        {name: 'image', type: 'texture', index: 0},
        {name: 'exposure', type: 'float', value: -1.0}
      ],
      output: 1
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'gboverlay',
      inputs: [
        {name: 'image', type: 'texture', index: 1},
      ],
      output: 2
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'gaussianblur',
      inputs: [
        {name: 'image', type: 'texture', index: 2}
      ],
      output: 1
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'highpass',
      inputs: [
        {name: 'image', type: 'texture', index: 2},
        {name: 'imageBlurred', type: 'texture', index: 1}
      ],
      output: 3
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'hardlight',
      inputs: [
        {name: 'image', type: 'texture', index: 3},
      ],
      output: 1
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'tonecurve',
      inputs: [
        {name: 'image', type: 'texture', index: 0},
        {name: 'low', type: 'float', value: 0.25},
        {name: 'mid', type: 'float', value: 0.52 + level*0.1},
        {name: 'high', type: 'float', value: 0.77 + level*0.1}
      ],
      output: 2
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'blend',
      inputs: [
        {name: 'image', type: 'texture', index: 0},
        {name: 'curved', type: 'texture', index: 2},
        {name: 'mask', type: 'texture', index: 1}
      ],
      output: 3
    })
    times.push(new Date() - t)
    t = new Date()
    this.filter({
      name: 'sharpen',
      inputs: [
        {name: 'image', type: 'texture', index: 3},
        {name: 'sharpen', type: 'float', value: 0.0+0.6*level}
      ],
      output: null
    })
    times.push(new Date() - t)

    // console.log('times', times)
  }
}

