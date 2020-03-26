precision mediump float;

// our texture
uniform sampler2D u_image;
uniform float u_sharpen;
// https://gitlab.bestminr.com/bestminr/FrontShaders/-/tree/7bfa25490a7e5746bc64f16a45f893a877a12805/shaders

uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
  vec4 image = texture2D(u_image, v_position);
  vec2 pixel = vec2(1.0, 1.0) / u_resolution;

  vec2 offset[4];
  offset[0] = vec2(0.0, -pixel.y);
  offset[1] = vec2(-pixel.x, 0.0);
  offset[2] = vec2(pixel.x, 0.0);
  offset[3] = vec2(0.0, pixel.y);

  vec4 sum = image * 5.0;
  for (int i = 0; i < 4; i++) {
    vec4 color = texture2D(u_image, v_position.xy + offset[i]);
    sum += color * -1.0;
  }

  gl_FragColor = mix(image, sum, u_sharpen);
}

