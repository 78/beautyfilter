<template>
  <div class="container">
    <div>
      <p>
      <label>原图：<input ref="showOriginal" 
        @change="onCheck" type="checkbox" value="identical" /></label>
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
import Test from '~/assets/test.png'
import Test2 from '~/assets/test2.jpeg'

export default {
  data() {
    return {
      showOriginal: false,
      options: {
        level: 0.5
      }
    }
  },

  mounted() {
    this.canvas = this.$refs.canvas

    this.lastTimestamp = 0
    this.onLoopBind = this.onLoop.bind(this)

    this.testVideo()
    //this.testImage(Test2)
  },

  methods: {
    testImage(img) {
      this.video = new Image
      this.video.onload = ()=> {
        this.canvas.width = 640
        this.canvas.height = this.canvas.width / this.video.width * this.video.height

        this.wf = new WebFilter(this.canvas)
        requestAnimationFrame(this.onLoopBind)
      }
      this.video.src = img
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
          requestAnimationFrame(this.onLoopBind)
        }
        this.video.srcObject = stream
      })

    },

    onLoop(timestamp) {
      requestAnimationFrame(this.onLoopBind)
      if(timestamp - this.lastTimestamp < 1000/15) {
        return
      }
      this.lastTimestamp = timestamp

      if(this.showOriginal) {
        this.wf.copy(this.video)
      } else {
        this.wf.beautify(this.video, this.options)
      }
    },

    onCheck(e) {
      this.showOriginal = e.target.checked
    },

    onSlider(e) {
      this.options = {level: e.target.value/10.}
    }
  }
}
</script>

<style>
canvas {
  background: black;
}
</style>
