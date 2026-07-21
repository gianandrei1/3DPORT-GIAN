import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type HolofaceProps = {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
};

const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uHover;
  uniform float uMode;  // 0.0 = wave (blue), 1.0 = lava (red)
  
  attribute vec3 aRandom;
  
  varying float vIntensity;
  varying float vLavaHeat;

  // Simple 3D hash noise for lava turbulence
  float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), u.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), u.x), u.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), u.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), u.x), u.y), u.z
    );
  }
  // Fractal Brownian Motion — layers of noise for lava texture
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec3(1.7, 9.2, 5.4);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 pos = position;
    vLavaHeat = 0.0;
    
    // 1. Idle organic movement (always on)
    float idleNoise = sin(pos.x * 2.0 + uTime) * cos(pos.y * 2.0 + uTime) * sin(pos.z * 2.0 + uTime);
    vec3 idleDisplacement = normalize(pos) * idleNoise * 0.05;
    pos += idleDisplacement;
    
    // 2. MODE-SPECIFIC ANIMATION
    if (uMode < 0.5) {
      // ── BLUE: Always-on ocean surface + hover ripple ──

      // ① Always-on layered ocean waves (slow FBM)
      vec3 oceanCoord = pos * 1.4 + vec3(uTime * 0.18, uTime * 0.12, uTime * 0.09);
      float ow1 = fbm(oceanCoord);
      float ow2 = fbm(oceanCoord * 0.75 + vec3(4.3, 2.1, 6.7) - uTime * 0.07);
      float oceanHeight = ow1 * 0.65 + ow2 * 0.35;

      vec3 normal = normalize(pos);
      pos += normal * (oceanHeight - 0.45) * 0.28;
      float surfaceGlint = smoothstep(0.35, 0.9, oceanHeight);

      // ② Hover / tap: cursor-driven ripple on top
      vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
      float distToMouse = length(worldPos - uMouse);
      float effectRadius = 2.5;
      float falloff = smoothstep(effectRadius, 0.0, distToMouse);
      float wave = sin(distToMouse * 12.0 - uTime * 8.0);
      if (distToMouse > 0.0) {
        pos += normal * wave * falloff * 0.2 * uHover;
      }
      pos += (aRandom - 0.5) * falloff * 0.05 * uHover;
      float force = max(0.0, wave * falloff) * uHover;

      vLavaHeat = clamp(surfaceGlint + force * 0.85, 0.0, 1.0);
      vIntensity = force;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      // Wave crests sparkle larger — like sunlight on water
      gl_PointSize = (1.3 + surfaceGlint * 1.8 + force * 2.0) * (10.0 / -mvPosition.z);
      vIntensity = force;
    } else if (uMode < 1.5) {
      // ── RED: Always-on FBM lava boiling + wave ripple on hover ──

      // ① Always-on lava boil (FBM turbulence)
      vec3 noiseCoord = pos * 1.8 + vec3(0.0, -uTime * 0.4, uTime * 0.15);
      float lava  = fbm(noiseCoord);
      float lava2 = fbm(noiseCoord + vec3(5.2, 1.3, 2.7) + uTime * 0.1);
      float heat  = lava * 0.7 + lava2 * 0.3;
      vec3 normal = normalize(pos);
      pos += normal * (heat - 0.4) * 0.45;
      float baseHeat = smoothstep(0.35, 0.85, heat);

      // ② Hover / tap: same water-wave ripple as blue, layered on top
      vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
      float distToMouse = length(worldPos - uMouse);
      float effectRadius = 2.5;
      float falloff = smoothstep(effectRadius, 0.0, distToMouse);
      float wave = sin(distToMouse * 12.0 - uTime * 8.0);
      if (distToMouse > 0.0) {
        pos += normal * wave * falloff * 0.2 * uHover;
      }
      pos += (aRandom - 0.5) * falloff * 0.05 * uHover;
      float waveForce = max(0.0, wave * falloff) * uHover;

      // Combine heat: boil baseline + wave peaks light up white-hot
      vLavaHeat = clamp(baseHeat + waveForce * 1.2, 0.0, 1.0);
      vIntensity = waveForce;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = (1.5 + baseHeat * 2.0 + waveForce * 3.0) * (10.0 / -mvPosition.z);
    } else if (uMode < 2.5) {
      // ── PURPLE: Always-on lightning ball + wave ripple on hover ──

      // ① Fast-flickering FBM noise for electric arcing tendrils
      float t = uTime * 0.3;
      vec3 noiseCoord = pos * 2.5 + vec3(t * 0.7, t * 0.5, t * 0.4);
      float bolt1 = fbm(noiseCoord);
      float bolt2 = fbm(noiseCoord * 1.6 + vec3(3.1, 5.9, 2.3) + t * 0.25);
      // Sharp threshold: only values above 0.54 become lightning tendrils
      float arc = max(0.0, bolt1 - 0.54) * 7.0;
      float arc2 = max(0.0, bolt2 - 0.57) * 9.0;
      float electricPeak = clamp(arc + arc2 * 0.5, 0.0, 1.0);
      // Subtle flicker to simulate electric discharge
      float flicker = 0.82 + 0.18 * sin(uTime * 12.0 + pos.x * 12.0 + pos.y * 8.0);

      vec3 normal = normalize(pos);
      pos += normal * electricPeak * 0.55 * flicker;

      // ② Hover / tap: wave ripple — same intensity as blue mode
      vec3 worldPos2 = (modelMatrix * vec4(pos, 1.0)).xyz;
      float distToMouse2 = length(worldPos2 - uMouse);
      float falloff2 = smoothstep(2.5, 0.0, distToMouse2);
      float wave2 = sin(distToMouse2 * 8.0 - uTime * 8.0);
      if (distToMouse2 > 0.0) {
        pos += normal * wave2 * falloff2 * 0.2 * uHover;
      }
      pos += (aRandom - 0.5) * falloff2 * 0.05 * uHover;
      float waveForce2 = max(0.0, wave2 * falloff2) * uHover;

      vLavaHeat = clamp(electricPeak * flicker + waveForce2 * 0.9, 0.0, 1.0);
      vIntensity = waveForce2;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = (1.2 + electricPeak * 4.5 * flicker + waveForce2 * 2.0) * (10.0 / -mvPosition.z);
    } else if (uMode < 3.5) {
      // ── GREEN: Earth / Nature — slow terrain FBM + hover ripple ──

      // ① Always-on slow terrain (continent-like topology)
      vec3 terrainCoord = pos * 1.6 + vec3(uTime * 0.05, uTime * 0.03, uTime * 0.04);
      float terrain1 = fbm(terrainCoord);
      float terrain2 = fbm(terrainCoord * 0.5 + vec3(2.3, 4.1, 1.7));
      float terrainHeight = terrain1 * 0.6 + terrain2 * 0.4;

      vec3 normalE = normalize(pos);
      pos += normalE * (terrainHeight - 0.42) * 0.32;
      float surfaceLevel = smoothstep(0.25, 0.85, terrainHeight);

      // ② Hover: Butterflies spawn (particles lift and flutter)
      vec3 worldPosE = (modelMatrix * vec4(pos, 1.0)).xyz;
      float distToMouseE = length(worldPosE - uMouse);
      float falloffE = smoothstep(2.5, 0.0, distToMouseE);
      
      // Butterfly flutter oscillation
      float flutterSpeed = 8.0; // matched to blue wave speed
      vec3 flutter = vec3(
        sin(uTime * flutterSpeed + aRandom.x * 20.0),
        cos(uTime * flutterSpeed * 1.2 + aRandom.y * 20.0),
        sin(uTime * flutterSpeed * 0.8 + aRandom.z * 20.0)
      );

      // Lift particles off the surface based on hover proximity
      float lift = falloffE * 0.2 * uHover;
      
      if (distToMouseE > 0.0) {
        // Move outwards along normal, add chaotic flutter, and spread out
        pos += normalE * lift;
        pos += flutter * lift * 0.4;
        pos += (aRandom - 0.5) * lift * 0.5;
      }
      
      float forceE = falloffE * uHover;

      // Make the flying butterflies light up brightly (towards snowCap color)
      vLavaHeat = clamp(surfaceLevel + forceE * 0.8, 0.0, 1.0);
      vIntensity = forceE;

      vec4 mvPositionE = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPositionE;
      // Flying butterflies appear larger and sparkle
      gl_PointSize = (1.3 + surfaceLevel * 1.5 + forceE * 3.5) * (10.0 / -mvPositionE.z);
    } else {
      // ── WHITE / WIND: fast sweeping noise + turbulent hover ──
      // ① Always-on fast wind currents
      vec3 windCoord = pos * 2.0 + vec3(uTime * 1.5, uTime * 0.4, -uTime * 1.2);
      float wind1 = fbm(windCoord);
      float wind2 = fbm(windCoord * 1.5 + vec3(2.0, 5.0, 3.0) + uTime * 0.8);
      float windPower = wind1 * 0.6 + wind2 * 0.4;

      vec3 normalW = normalize(pos);
      pos += normalW * (windPower - 0.4) * 0.35;
      float windHighlight = smoothstep(0.4, 0.85, windPower);

      // ② Hover / tap: chaotic swirling gusts
      vec3 worldPosW = (modelMatrix * vec4(pos, 1.0)).xyz;
      float distToMouseW = length(worldPosW - uMouse);
      float falloffW = smoothstep(2.5, 0.0, distToMouseW);
      
      // Fast, turbulent gusty wave
      float windWave = sin(distToMouseW * 10.0 - uTime * 15.0);
      float gustNoise = fbm(pos * 3.0 + vec3(uTime * 4.0, uTime * -2.0, uTime * 3.0));
      float turbulentWave = windWave * gustNoise;

      if (distToMouseW > 0.0) {
        pos += normalW * turbulentWave * falloffW * 0.3 * uHover;
        // add scattering
        pos += (aRandom - 0.5) * gustNoise * falloffW * 0.15 * uHover;
      }
      
      float forceW = max(0.0, turbulentWave * falloffW) * uHover;
      
      vLavaHeat = clamp(windHighlight + forceW * 0.85, 0.0, 1.0);
      vIntensity = forceW;

      vec4 mvPositionW = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPositionW;
      gl_PointSize = (1.3 + windHighlight * 1.8 + forceW * 2.0) * (10.0 / -mvPositionW.z);
    }
  }
`;

const fragmentShader = `
  varying float vIntensity;
  varying float vLavaHeat;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uActiveColor;
  uniform float uMode;
  
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.1, dist);
    
    vec3 finalColor;
    float finalAlpha;

    if (uMode < 0.5) {
      // ── BLUE: Ocean coloring ──
      vec3 deepOcean = vec3(0.0,  0.07, 0.32);  // deep navy
      vec3 midOcean  = vec3(0.0,  0.42, 0.72);  // ocean blue
      vec3 surface   = vec3(0.25, 0.82, 0.98);  // bright teal-cyan
      vec3 foam      = vec3(0.90, 0.97, 1.0);   // white sea foam
      finalColor = mix(deepOcean, midOcean, smoothstep(0.0,  0.38, vLavaHeat));
      finalColor = mix(finalColor, surface,  smoothstep(0.38, 0.72, vLavaHeat));
      finalColor = mix(finalColor, foam,     smoothstep(0.72, 1.0,  vLavaHeat));
      finalAlpha = alpha * (0.38 + vLavaHeat * 0.55);
    } else if (uMode < 1.5) {
      // ── RED: Lava coloring ──
      vec3 lavaDark  = vec3(0.6, 0.02, 0.0);
      vec3 lavaGlow  = vec3(1.0, 0.25, 0.0);
      vec3 lavaWhite = vec3(1.0, 0.9, 0.6);
      finalColor = mix(lavaDark, lavaGlow, smoothstep(0.0, 0.55, vLavaHeat));
      finalColor = mix(finalColor, lavaWhite, smoothstep(0.55, 1.0, vLavaHeat));
      finalAlpha = alpha * (0.45 + vLavaHeat * 0.55);
    } else if (uMode < 2.5) {
      // ── PURPLE: Lightning coloring ──
      vec3 boltDark  = vec3(0.15, 0.0,  0.45);
      vec3 boltMid   = vec3(0.6,  0.1,  1.0);
      vec3 boltWhite = vec3(0.92, 0.82, 1.0);
      finalColor = mix(boltDark, boltMid,   smoothstep(0.0,  0.5,  vLavaHeat));
      finalColor = mix(finalColor, boltWhite, smoothstep(0.5,  1.0,  vLavaHeat));
      finalAlpha = alpha * (0.4 + vLavaHeat * 0.6);
    } else if (uMode < 3.5) {
      // ── GREEN: Earth / Nature coloring ──
      vec3 deepOcean  = vec3(0.0,  0.12, 0.45);  // deep ocean
      vec3 shallowSea = vec3(0.04, 0.38, 0.58);  // coastal water
      vec3 lowland    = vec3(0.12, 0.52, 0.12);  // jungle / lowland
      vec3 highland   = vec3(0.28, 0.48, 0.10);  // savanna / highland
      vec3 snowCap    = vec3(0.90, 0.93, 0.95);  // snow / clouds
      finalColor = mix(deepOcean,  shallowSea, smoothstep(0.0,  0.25, vLavaHeat));
      finalColor = mix(finalColor, lowland,    smoothstep(0.25, 0.52, vLavaHeat));
      finalColor = mix(finalColor, highland,   smoothstep(0.52, 0.78, vLavaHeat));
      finalColor = mix(finalColor, snowCap,    smoothstep(0.78, 1.0,  vLavaHeat));
      finalAlpha = alpha * (0.40 + vLavaHeat * 0.50);
    } else {
      // ── WHITE / WIND coloring ──
      finalColor = mix(uBaseColor, uHighlightColor, smoothstep(0.0, 0.5, vLavaHeat));
      finalColor = mix(finalColor, uActiveColor, smoothstep(0.5, 1.0, vLavaHeat));
      finalAlpha = alpha * (0.38 + vLavaHeat * 0.55);
    }

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

export default function Holoface(props: HolofaceProps) {
  const group = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  
  const targetHover = useRef(0);
  const currentHover = useRef(0);
  const targetMousePos = useRef(new THREE.Vector3(0, 0, 1000));
  const currentMousePos = useRef(new THREE.Vector3(0, 0, 1000));

  useEffect(() => {
    const tempGeo = new THREE.IcosahedronGeometry(1.3, 40);
    const numParticles = tempGeo.attributes.position.count;
    
    const randoms = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
    }
    
    tempGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    setGeometry(tempGeo);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 1000) },
      uHover: { value: 0 },
      uMode: { value: 0.0 },  // 0 = wave, 1 = lava
      uBaseColor: { value: new THREE.Color(0.05, 0.3, 0.8) },
      uHighlightColor: { value: new THREE.Color(0.0, 1.0, 1.0) },
      uActiveColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
    }),
    []
  );

  const [colorIndex, setColorIndex] = useState(0);

  const colorSchemes = useMemo(() => [
    { base: new THREE.Color(0.05, 0.3, 0.8),   highlight: new THREE.Color(0.0, 1.0, 1.0),  active: new THREE.Color(1.0, 1.0, 1.0) }, // Blue
    { base: new THREE.Color(0.8, 0.05, 0.05),  highlight: new THREE.Color(1.0, 0.2, 0.2),  active: new THREE.Color(1.0, 1.0, 1.0) }, // Red
    { base: new THREE.Color(0.3, 0.0, 0.8),    highlight: new THREE.Color(0.7, 0.2, 1.0),  active: new THREE.Color(0.95, 0.85, 1.0) }, // Purple (lightning)
    { base: new THREE.Color(0.05, 0.8, 0.05), highlight: new THREE.Color(0.2, 1.0, 0.2), active: new THREE.Color(1.0, 1.0, 1.0) }, // Green
    { base: new THREE.Color(0.65, 0.7, 0.75), highlight: new THREE.Color(0.9, 0.95, 1.0), active: new THREE.Color(1.0, 1.0, 1.0) }, // White / Wind
  ], []);

  useEffect(() => {
    // Apply the active theme highlight color to a global CSS variable for hover text effects
    const themeHoverColors = [
      '#00ffff', // Blue (cyan)
      '#ff3333', // Red (light red)
      '#b333ff', // Purple (light purple)
      '#33ff33', // Green (light green)
      '#e6f2ff', // White / Wind (pale cyan/white)
    ];
    document.documentElement.style.setProperty('--theme-color', themeHoverColors[colorIndex]);
  }, [colorIndex]);

  useFrame((state, delta) => {
    currentHover.current = THREE.MathUtils.damp(currentHover.current, targetHover.current, 3.0, delta);
    currentMousePos.current.lerp(targetMousePos.current, 0.3);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uHover.value = currentHover.current;
      materialRef.current.uniforms.uMouse.value.copy(currentMousePos.current);

      // 0=ocean(blue), 1=lava(red), 2=lightning(purple), 3=earth(green), 4=generic(white)
      const targetMode = colorIndex === 1 ? 1.0 : colorIndex === 2 ? 2.0 : colorIndex === 0 ? 0.0 : colorIndex === 3 ? 3.0 : 4.0;
      materialRef.current.uniforms.uMode.value = targetMode;

      const targetColors = colorSchemes[colorIndex];
      materialRef.current.uniforms.uBaseColor.value.lerp(targetColors.base, 0.1);
      materialRef.current.uniforms.uHighlightColor.value.lerp(targetColors.highlight, 0.1);
      materialRef.current.uniforms.uActiveColor.value.lerp(targetColors.active, 0.1);
    }
  });

  const handlePointerMove = (e: any) => {
    targetMousePos.current.copy(e.point);
  };

  const handlePointerDown = (e: any) => {
    setColorIndex((prev) => (prev + 1) % colorSchemes.length);
  };

  const handlePointerOver = () => {
    targetHover.current = 1;
    document.body.style.cursor = 'crosshair';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    targetHover.current = 0;
  };

  return (
    <group ref={group} {...props} dispose={null}>
      
      {/* Invisible sphere explicitly controls interactions — only triggers when hovering the physical sphere volume */}
      <mesh 
        visible={false} 
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {geometry && (
        <points geometry={geometry}>
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}
