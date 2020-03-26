precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
  vec4 image = texture2D(u_image, v_position);
  float ba = 2.0 * image.g * image.b;
  gl_FragColor = vec4(ba,ba,ba,image.a);
}
