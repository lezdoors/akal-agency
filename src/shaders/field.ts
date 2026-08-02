/** GLSL for the opportunity point field (Points) — lit, sculptural, not uniform. */
export const fieldVertex = /* glsl */ `
uniform float uSize;
uniform float uTime;
uniform vec3 uLight;
attribute float aSeed;
varying float vJitter;
varying float vLit;
void main() {
  vJitter = aSeed;
  // Object-space normal (sphere centered at origin) → directionally lit depth.
  vec3 n = normalize(position);
  float diff = max(dot(n, uLight), 0.0);
  // Restrained light: far side stays dark, lit side revealed; per-point noise
  // gives internal hierarchy instead of a uniform ball.
  vLit = mix(0.16, 1.0, diff) + (aSeed - 0.5) * 0.3;
  vLit = clamp(vLit, 0.0, 1.6);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = uTime * 0.15 + aSeed * 6.2831;
  gl_PointSize = uSize * (1.0 + 0.14 * sin(tw)) * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

export const fieldFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vJitter;
varying float vLit;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float alpha = smoothstep(0.5, 0.3, d) * uOpacity;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uColor * vLit, alpha);
}`;
