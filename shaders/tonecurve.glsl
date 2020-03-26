precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_low;
uniform float u_mid;
uniform float u_high;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;


/*
    This function is the single channel response.
    It is a piecewise function of two degree 3 polynomials.
    
    The first  goes through 0,   0.25 and 0.5.
    The second goes through 0.5, 0.75 and 1.
    The derivative at the midpoint is set to 1.
*/
float simple_tonecurve_ch(in float x, in float l, in float m, in float h)
{    
    if (x < 0.5)
    {
        return (1. + 16. * l - 8. * m) * x - 2. * (3. + 32. * l - 22. *  m) * x * x 
            +   8. * (1. + 8. * l - 6. * m) * x * x * x; 
    }
    return 2. * (-3. + 8. * h - 6. * m) + (29. - 80. * h + 64. * m) * x 
        +  2. * (-23. + 64. * h - 50. * m) * x * x 
        -  8. * (-3. + 8. * h - 6. * m) * x * x * x;
}

/*
    A simple tonecurve function for values between [0,1] with three control 
    points. The function is pointwise so just apply it to every pixel's colour.
    
    The three control points are at 1/4, 1/2 and 3/4.
    When (low, mid, high) = (1/4, 1/2, 3/4) the response is pretty much a linear
    x function. The function is then in essence pass through (except for float
    -ing point problems) and the image (more or less) visually the same.
    For simple "S-curve" manipulations, it is recommended to keep "mid" at a 
    value of 0.5.
    A light contrast enhancing curve is produced with something like 
        (low, mid, high) = (0.19, 0.5, 0.804)
    This function yields very similar results to Photoshop's curve tool with
    control points at the same places. The exception is when the curve under or
    overshoots, since Photoshop clamps the value.
    If you want almost the same behaviour as PS', just clamp the result between
    vec3(0) and vec3(1). 
*/
vec3 simple_tonecurve_rgb(in vec3 rgb, in float low, in float mid, in float high)
{
    return vec3(
        clamp(simple_tonecurve_ch(rgb.r, low, mid, high), 0., 1.),
        clamp(simple_tonecurve_ch(rgb.g, low, mid, high), 0., 1.),
        clamp(simple_tonecurve_ch(rgb.b, low, mid, high), 0., 1.)
    );
}


void main() {
  vec4 image = texture2D(u_image, v_position);
  gl_FragColor = vec4(simple_tonecurve_rgb(image.rgb, u_low, u_mid, u_high), image.a);
}

