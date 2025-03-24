export const cardGlowShader = {
  key: 'CardGlow',
  fragment: `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 color;

        void main() {
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            float dist = distance(uv, vec2(0.5));
            
            float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
            
            float wave1 = sin(time * 2.0) * 0.5 + 0.5;
            float wave2 = sin(time * 3.0 + 1.57) * 0.5 + 0.5;
            
            float glow = wave1 * wave2 * 1.5;
            
            vec3 finalColor = color * (0.8 + 0.4 * sin(time));
            
            gl_FragColor = vec4(finalColor, alpha * glow);
        }
    `,
}
