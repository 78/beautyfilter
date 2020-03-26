<template>
  <div class="container">
    <div>
      <p>
      <label>原图：<input @change="onCheck" type="checkbox" value="identical" /></label>
      </p>
      <p>
      <label>磨皮：<input @change="onSlider" type="range" step="1" min="1" max="10" value="5" /></label>
      </p>
    </div>
    <div>
      Canvas
    </div>
    <div>
      <canvas ref="canvas" width="480" height="270"></canvas>
    </div>
    <div>
      <video ref="video" width="480" height="270" autoplay playsinline></video>
    </div>
  </div>
</template>

<script>
import WebFilter from '~/core/WebFilter.js'
import TestPng from '~/assets/test.png'

export default {
  mounted() {
    this.canvas = this.$refs.canvas

    this.filter = "bilateral"
    this.lastTimestamp = 0

    //this.testVideo()
    this.testImage()
  },

  methods: {
    testImage() {
      this.video = new Image
      this.video.onload = ()=> {
        this.canvas.width = 480
        this.canvas.height = 480 / this.video.width * this.video.height

        this.wf = new WebFilter(this.canvas)
        requestAnimationFrame(this.onLoop.bind(this))
      }
      this.video.src = TestPng
    },

    testVideo() {
      this.video = this.$refs.video
      navigator.mediaDevices.getUserMedia({video: {
        frameRate: 15,
        facingMode: 'user'
      }}).then((stream) => {
        this.video.onloadedmetadata = () => {
          this.canvas.width = 480
          this.canvas.height = 480 / this.video.videoWidth * this.video.videoHeight

          this.wf = new WebFilter(this.canvas)
          requestAnimationFrame(this.onLoop.bind(this))
        }
        this.video.srcObject = stream
      })

    },

    onLoop(timestamp) {
      requestAnimationFrame(this.onLoop.bind(this))
      if(timestamp - this.lastTimestamp < 1000/15) {
        return
      }
      this.lastTimestamp = timestamp

      this.wf.render(this.video, this.filter, this.filterOptions)
    },

    onCheck(e) {
      if(e.target.checked) {
        this.filter = 'identical'
      } else {
        this.filter = 'bilateral'
      }
    },

    onSlider(e) {
      const min = 0.02, max = 0.16
      const sigma = min + (e.target.value / 10.0)*(max-min)
      this.filterOptions = {sigma}
    }
  }
}
</script>

<style>
canvas {
  background: black;
}
</style>
