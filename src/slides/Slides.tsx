import anime from "animejs";
import React from "react";
import ReactDOM from "react-dom";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  Uniform,
  Vector2,
  WebGLRenderer
} from "three";
// import { SlideQuote } from "./SlideQuote";
import {
  getMaxTitleLength,
  getTextures,
  // getMaxQuoteLength,
  // getMaxAuthorNameLength,
  // getMaxAuthorTitleLength,
  SlidesData
} from "./SlidesData";
import { SlideTitle } from "./SlideTitle";

const nSlides = SlidesData.length;
let currentSlide = 0;
let nextSlide = (currentSlide + 1) % nSlides;
const maxTitleLength = getMaxTitleLength();
// const maxQuoteLength = getMaxQuoteLength();
// const maxAuthorNameLength = getMaxAuthorNameLength();
// const maxAuthorTitleLength = getMaxAuthorTitleLength();
const textures = getTextures();

const configuration = {
  Intensity: 0.2
};

// Html/Three.js initialization.
const canvas = document.getElementById("project-canvas") as HTMLCanvasElement;
const titleDiv = document.getElementById("project-title") as HTMLDivElement;
// const quoteDiv = document.getElementById("project-quote") as HTMLDivElement;

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
    textureA: new Uniform(textures[currentSlide]),
    textureB: new Uniform(textures[nextSlide]),
    textureScaleA: new Uniform(new Vector2(1.0, 1.0)),
    textureScaleB: new Uniform(new Vector2(1.0, 1.0)),
    opacity: new Uniform(0.0),
    progress: new Uniform(0.0),
    intensity: new Uniform(configuration.Intensity)
  },
  vertexShader: `
        attribute vec2 position;
        varying vec2 vUV;
        varying vec2 vUVA;
        varying vec2 vUVB;
        uniform vec2 textureScaleA;
        uniform vec2 textureScaleB;

        void main() {
          vUV = position * 0.5 + 0.5;
          vUVA = position / textureScaleA * 0.5 + 0.5 ;
          vUVB = position / textureScaleB * 0.5 + 0.5 ;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
  fragmentShader: `
        precision highp float;
        precision highp int;
        varying vec2 vUV;
        varying vec2 vUVA;
        varying vec2 vUVB;
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        uniform float opacity;
        uniform float progress;
        uniform float intensity;

        float dither2x2(vec2 position, float brightness) {
          int x = int(mod(position.x, 2.0));
          int y = int(mod(position.y, 2.0));
          int index = x + y * 2;
          float limit = 0.0;
          
          if (x < 8) {
              if (index == 0) limit = 0.25;
              if (index == 1) limit = 0.75;
              if (index == 2) limit = 1.00;
              if (index == 3) limit = 0.50;
          }
          
          return brightness < limit ? 0.0 : 1.0;
        }

        void main() {          
          vec4 d1 = texture2D(textureA, vUVA);
          vec4 d2 = texture2D(textureB, vUVB);
  
          float displace1 = (d1.r + d1.g + d1.b) * 0.33;
          float displace2 = (d2.r + d2.g + d2.b) * 0.33;
          
          vec4 t1 = texture2D(textureA, vec2(vUVA.x, vUVA.y + progress * (displace2 * intensity)));
          vec4 t2 = texture2D(textureB, vec2(vUVB.x, vUVB.y + (1.0 - progress) * (displace1 * intensity)));
  
          vec4 color = mix(t1, t2, progress);
          float brightness = color.g;

          float distX = (clamp(1.0 - distance(vUV.x, 0.5) * 2.0 + 0.95, 0.0, 1.0) - 0.95) * 20.0;
          float distY = (clamp(1.0 - distance(vUV.y, 0.5) * 2.0 + 0.95, 0.0, 1.0) - 0.95) * 20.0;
          float vignette = distX * distY;

          gl_FragColor = vec4(vignette * dither2x2(gl_FragCoord.xy, opacity * brightness));
        }`,
  depthTest: false,
  depthWrite: false
});
const mesh = new Mesh(geometry, material);
mesh.frustumCulled = false; // Just here to silence a console error.

scene.add(mesh);

const fadeInAnimation = anime({
  autoplay: false,
  targets: material.uniforms.opacity,
  value: [{ value: 1.0, duration: 5000 }],
  easing: "easeOutExpo"
});

let animationTimeout: NodeJS.Timeout;
const animation = anime({
  autoplay: true,
  targets: material.uniforms.progress,
  value: [{ value: 1.0, duration: 500 }],
  easing: "linear",
  begin: () => {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    if (!fadeInAnimation.began) {
      fadeInAnimation.play();
    }
  },
  complete: () => {
    currentSlide = nextSlide;
    nextSlide = (currentSlide + 1) % nSlides;

    material.uniforms.textureA.value = textures[currentSlide];
    material.uniforms.textureB.value = textures[nextSlide];
    material.uniforms.progress.value = 0.0;

    animationTimeout = setTimeout(() => {
      animation.play();
    }, 3000);
  }
});
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  if (event.button === 0) {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
  }
});
canvas.addEventListener("mouseup", (event: MouseEvent) => {
  if (event.button === 0) {
    animation.play();
  }
});

let title = SlidesData[currentSlide].title;
let link = SlidesData[currentSlide].link;
// let quote = SlidesData[currentSlide].quote;
// let authorName = SlidesData[currentSlide].authorName;
// let authorTitle = SlidesData[currentSlide].authorTitle;

export function animate() {
  requestAnimationFrame(animate);
  if (isCanvasVisible) {
    if (material.uniforms.textureA.value !== undefined) {
      material.uniforms.textureScaleA.value.set(
        material.uniforms.textureA.value.image.width / canvas.offsetWidth,
        material.uniforms.textureA.value.image.height / canvas.offsetHeight
      );
    }
    if (material.uniforms.textureB.value !== undefined) {
      material.uniforms.textureScaleB.value.set(
        material.uniforms.textureB.value.image.width / canvas.offsetWidth,
        material.uniforms.textureB.value.image.height / canvas.offsetHeight
      );
    }
    renderer.render(scene, camera);

    const progress = material.uniforms.progress.value;

    const titleCPs = [];
    for (let i = 0; i < maxTitleLength; ++i) {
      const cpA = SlidesData[currentSlide].title.codePointAt(i) || 0;
      const cpB = SlidesData[nextSlide].title.codePointAt(i) || 0;
      let cp = Math.round((1.0 - progress) * cpA + progress * cpB);
      if (progress !== 0 && (cpA === 32 || cpB === 32)) {
        cp = 32;
      }
      titleCPs.push(cp);
    }
    title = String.fromCodePoint(...titleCPs);
    link = SlidesData[currentSlide].link;

    /* const quoteCPs = [];
    for (let i = 0; i < maxQuoteLength; ++i) {
      const cpA = SlidesData[currentSlide].quote.codePointAt(i) | 0;
      const cpB = SlidesData[nextSlide].quote.codePointAt(i) | 0;
      let cp = Math.round((1.0 - progress) * cpA + progress * cpB);
      if (progress !== 0 && (cpA === 32 || cpB === 32)) {
        cp = 32;
      }
      quoteCPs.push(cp);
    }
    quote = String.fromCodePoint(...quoteCPs);

    const authorNameCPs = [];
    for (let i = 0; i < maxAuthorNameLength; ++i) {
      const cpA = SlidesData[currentSlide].authorName.codePointAt(i) | 0;
      const cpB = SlidesData[nextSlide].authorName.codePointAt(i) | 0;
      let cp = Math.round((1.0 - progress) * cpA + progress * cpB);
      if (progress !== 0 && (cpA === 32 || cpB === 32)) {
        cp = 32;
      }
      authorNameCPs.push(cp);
    }
    authorName = String.fromCodePoint(...authorNameCPs);

    const authorTitleCPs = [];
    for (let i = 0; i < maxAuthorTitleLength; ++i) {
      const cpA = SlidesData[currentSlide].authorTitle.codePointAt(i) | 0;
      const cpB = SlidesData[nextSlide].authorTitle.codePointAt(i) | 0;
      let cp = Math.round((1.0 - progress) * cpA + progress * cpB);
      if (progress !== 0 && (cpA === 32 || cpB === 32)) {
        cp = 32;
      }
      authorTitleCPs.push(cp);
    }
    authorTitle = String.fromCodePoint(...authorTitleCPs); */

    ReactDOM.render(<SlideTitle title={title} link={link} />, titleDiv);
    /* ReactDOM.render(
      <SlideQuote quote={quote} author={authorName} title={authorTitle} />,
      quoteDiv
    ); */
  }
}
