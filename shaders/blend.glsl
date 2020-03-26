precision mediump float;

// our texture
uniform sampler2D u_image;
uniform sampler2D u_curved;
uniform sampler2D u_mask;
uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
  vec4 image = texture2D(u_image, v_position);
  vec4 curved = texture2D(u_curved, v_position);
  vec4 mask = texture2D(u_mask, v_position);
  vec3 final = mix(image.rgb, curved.rgb, 1.0-mask.r);
  gl_FragColor = vec4(final, 1.0);
}
