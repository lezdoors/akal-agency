/** GLSL for the opportunity point field (Points). */
export const fieldVertex = /* glsl */ `
uniform float uSize;
uniform float uTime;
attribute float aSeed;
varying float vJitter;
void main() {
  vJitter = aSeed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = uTime * 0.15 + aSeed * 6.2831;
  gl_PointSize = uSize * (1.0 + 0.14 * sin(tw)) * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

export const fieldFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vJitter;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float alpha = smoothstep(0.5, 0.3, d) * uOpacity;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uColor, alpha);
}`;
