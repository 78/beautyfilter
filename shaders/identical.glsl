precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
  gl_FragColor = texture2D(u_image, v_position);
}
