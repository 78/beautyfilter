precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_texSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  vec4 p = texture2D(u_image, v_texCoord);
  float v = (p.x+p.y+p.z)/3.0;
  gl_FragColor = vec4(v,v,v,1.0);
}
