precision mediump float;

// our texture
uniform sampler2D u_image;
uniform float u_exposure;
uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
  vec4 image = texture2D(u_image, v_position);
  gl_FragColor = vec4(image.rgb * pow(2.0, u_exposure), image.a);
}
