precision mediump float;

#define texture texture2D

#define MSIZE 15

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_kernel[MSIZE];
uniform float u_sigma;

// the v_position passed in from the vertex shader.
varying vec2 v_position;


float normpdf(in float x, in float sigma)
{
  return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}

float normpdf3(in vec3 v, in float sigma)
{
  return 0.39894*exp(-0.5*dot(v,v)/(sigma*sigma))/sigma;
}

void main() {
  vec2 pixel = vec2(1.0, 1.0) / u_resolution;

  vec3 c = texture(u_image, v_position).rgb;

  //declare stuff
  const int kSize = (MSIZE-1)/2;
  vec3 final_color = vec3(0.0);
  float Z = 0.0;
  float bZ = 1.0/normpdf(0.0, u_sigma);
  //read out the texels
  for (int i=-kSize; i <= kSize; ++i)
  {
    for (int j=-kSize; j <= kSize; ++j)
    {
      vec3 cc = texture(u_image, v_position + pixel*vec2(float(i),float(j))).rgb;
      float factor = normpdf3(cc-c, u_sigma)*bZ*u_kernel[kSize+j]*u_kernel[kSize+i];
      Z += factor;
      final_color += factor*cc;
    }
  }
  
  gl_FragColor = vec4(final_color/Z, 1.0);
}


