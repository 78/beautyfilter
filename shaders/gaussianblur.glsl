precision mediump float;

#define texture texture2D

#define MSIZE 9

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_kernel[MSIZE];
uniform float u_kernel_sumsqrt;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;


void main()
{
  vec2 pixel = vec2(1.0, 1.0) / u_resolution;
  vec3 c = texture(u_image, v_position).rgb;

  //declare stuff
  const int kSize = (MSIZE-1)/2;
  vec3 final_color = vec3(0.0);

  //read out the texels
  for (int i=-kSize; i <= kSize; ++i)
  {
    for (int j=-kSize; j <= kSize; ++j)
    {
      vec3 cc = texture(u_image, (v_position.xy+pixel*vec2(float(i),float(j)))).rgb;
      final_color += u_kernel[kSize+j]*u_kernel[kSize+i]*cc;
    }
  }
  
  
  gl_FragColor = vec4(final_color/(u_kernel_sumsqrt), 1.0);
}
