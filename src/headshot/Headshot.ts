import anime, { AnimeInstance } from "animejs";
import {
  BufferAttribute,
  BufferGeometry,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  Texture,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer
} from "three";

const configurationRes = new Vector2(896, 509);
const dotResolution = 64;

// Html/Three.js initialization.
const canvas = document.getElementById("headshot-canvas") as HTMLCanvasElement;

let isCanvasVisible = false;
const intersectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    isCanvasVisible = entry.isIntersecting;
  });
});
intersectionObserver.observe(canvas);

const renderer = new WebGLRenderer({ canvas });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new OrthographicCamera(0, 0, 0, 0, 0, 0);

window.addEventListener("resize", (event: UIEvent) => {
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);
  material.uniforms.dotSize.value =
    canvas.offsetWidth /
    (dotResolution / window.devicePixelRatio) /
    Math.min(
      1.0,
      window.innerWidth < window.innerHeight
        ? window.innerHeight / configurationRes.y
        : window.innerWidth / configurationRes.x
    );
});

const scene = new Scene();
const geometry = new BufferGeometry();
geometry.setAttribute(
  "position",
  new BufferAttribute(
    new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
    2
  )
);
const material = new RawShaderMaterial({
  uniforms: {
    texture: new Uniform(Texture.DEFAULT_IMAGE),
    opacity: new Uniform(0.0),
    dotSize: new Uniform(
      canvas.offsetWidth /
        (dotResolution / window.devicePixelRatio) /
        Math.min(
          1.0,
          window.innerWidth < window.innerHeight
            ? window.innerHeight / configurationRes.y
            : window.innerWidth / configurationRes.x
        )
    ),
    exposure: new Uniform(1.5)
  },
  vertexShader: `
        attribute vec2 position;
        varying vec2 vUV;

        void main() {
          vUV = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
  fragmentShader: `
        precision highp float;
        precision highp int;
        varying vec2 vUV;
        uniform sampler2D texture;
        uniform float opacity;
        uniform float dotSize;
        uniform float exposure;

        float aastep(float threshold, float value) {
          float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
          return smoothstep(threshold-afwidth, threshold+afwidth, value);
        }

        void main() {
          vec2 rotatedUV = mod(mat2(0.707, -0.707, 0.707, 0.707) * gl_FragCoord.xy, dotSize) / dotSize;
          vec2 nearest = 2.0*fract(rotatedUV) - 1.0;
          float dist = length(nearest);

          float vignette = clamp(1.0 - distance(vUV, vec2(0.5)) * 2.0, 0.0, 1.0);
          vignette = pow(vignette, 0.5);
          
          vec3 texcolor = texture2D(texture, vUV).rgb * exposure;
          float radius = sqrt(texcolor.g) * vignette;
          vec3 color = vec3(1.0 - aastep(radius, dist));
          
          gl_FragColor = vec4(color, opacity * vignette);
        }`,
  depthTest: false,
  depthWrite: false,
  transparent: true,
  extensions: {
    derivatives: true
  }
});
const mesh = new Mesh(geometry, material);
mesh.frustumCulled = false; // Just here to silence a console error.

scene.add(mesh);

const fadeInAnimation = anime
  .timeline({
    autoplay: false,
    targets: material.uniforms.opacity,
    value: [{ value: 1.0, duration: 5000 }],
    easing: "easeOutExpo"
  })
  .add({
    targets: "li",
    opacity: [{ value: "1.0", duration: 2000 }],
    delay: anime.stagger(400)
  });
const textureLoader = new TextureLoader().load(
  "../resources/headshot.jpg",
  texture => {
    texture.minFilter = LinearFilter;
    material.uniforms.texture.value = texture;
  }
);

export function animate() {
  requestAnimationFrame(animate);
  if (isCanvasVisible) {
    const boundingClient = canvas.getBoundingClientRect();
    const fireAnimation =
      boundingClient.top + boundingClient.height * 0.5 <= window.innerHeight &&
      !fadeInAnimation.began;
    if (fireAnimation) {
      fadeInAnimation.play();
    }

    renderer.render(scene, camera);
  }
}
