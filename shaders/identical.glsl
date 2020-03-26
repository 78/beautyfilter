precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_texSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  gl_FragColor = texture2D(u_image, v_texCoord);
}
