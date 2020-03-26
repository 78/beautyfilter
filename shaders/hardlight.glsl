precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_resolution;

// the texCoords passed in from the vertex shader.
varying vec2 v_position;

void main() {
    vec4 image = texture2D(u_image, v_position);
    float hardLightColor = image.b;

    for (int i = 0; i < 3; ++i) {
        if (hardLightColor < 0.5) {
            hardLightColor = hardLightColor  * hardLightColor * 2.;
        } else {
            hardLightColor = 1. - (1. - hardLightColor) * (1. - hardLightColor) * 2.;
        }
    }

    const float k = 255.0 / (164.0 - 75.0);

    hardLightColor = (hardLightColor - 75.0 / 255.0) * k;

    gl_FragColor = vec4(vec3(hardLightColor), image.a);
}
