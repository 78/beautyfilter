precision mediump float;

// our texture
uniform sampler2D u_image;
uniform sampler2D u_imageBlurred;
uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
  vec4 image = texture2D(u_image, v_position);
  vec4 imageBlurred = texture2D(u_imageBlurred, v_position);
  vec3 p = image.rgb - imageBlurred.rgb + vec3(0.5,0.5,0.5);
  gl_FragColor = vec4(p, image.a);
}
