#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform int u_NumCells;
uniform int u_Time;
uniform float u_FoamSpeed;
uniform float u_FoamRoughness;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec2 fs_UV;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

vec3 random3(vec3 p) {
    vec4 vals = vec4(443.897, 441.423, .0973, .1099);
    p = fract(p * vals.xyz);
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
}

vec2 worley2(vec3 p) {
    // Cube is hardcoded to be between -1 and 1, normalize to [0, 1]
    p = 0.5 * p + 0.5;
    p *= float(u_NumCells);

    vec3 n = floor( p );
    vec3 f = fract( p );

    float distF1 = 1.0;
    float distF2 = 1.0;
    vec3 off1 = vec3(0.0);
    vec3 pos1 = vec3(0.0);
    vec3 off2 = vec3(0.0);
    vec3 pos2 = vec3(0.0);
    for( int k = -1; k <= 1; k++ ) {
        for( int j= -1; j <= 1; j++ ) {
            for( int i=-1; i <= 1; i++ ) {	
                vec3  g = vec3(i,j,k);
                vec3  o = random3( n + g );
                vec3  p = g + o;
                float d = distance(p, f);
                if (d < distF1) {
                    distF2 = distF1;
                    distF1 = d;
                    off2 = off1;
                    off1 = g;
                    pos2 = pos1;
                    pos1 = p;
                }
                else if (d < distF2) {
                    distF2 = d;
                    off2 = g;
                    pos2 = p;
                }
            }
        }
    }

    return vec2(distF1, distF2);
}

float worley(vec3 p) { 
    return 1.0-worley2(p).x;
}

float easeInExpo_mod(float x) {
    return x == 0.0 ? 0.0 : clamp(pow(2.0, 10.0 * x - 7.5), 0.0, 1.0);
}

void main()
{
    // Material base color (before shading)
    vec4 color = u_Color;

    float foam0 = worley(fs_Pos.zxy + vec3(float(u_Time) * mix(0.00005, 0.003, u_FoamSpeed / 10.0)) + random3(fs_Pos.zxy) * u_FoamRoughness / 2.0);
    foam0 *= easeInExpo_mod(foam0);
    foam0 *= foam0;
    if (foam0 < 0.002) {
        color = mix(vec4(0, 0, 0, 1), u_Color, 0.75);
    }

    float foam1 = worley(fs_Pos.xyz + vec3(float(u_Time) * mix(0.0001, 0.01, u_FoamSpeed / 10.0)) + random3(fs_Pos.xyz) * u_FoamRoughness);
    foam1 = easeInExpo_mod(foam1);
    foam1 *= foam1;
    if (foam1 < 0.01) {
        color = mix(vec4(1.0), u_Color, 0.5);
    }
    
    out_Col = color;
}
