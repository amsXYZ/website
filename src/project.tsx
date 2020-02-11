import anime from "animejs";
import React from "react";
import ReactDOM from "react-dom";
import {
  BufferAttribute,
  BufferGeometry,
  LinearFilter,
  Mesh,
  MirroredRepeatWrapping,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  Texture,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer
} from "three";
import { ProjectDescription } from "./projects/ProjectDescription";
import { ProjectLinks } from "./projects/ProjectLinks";
import { ProjectTable } from "./projects/ProjectTable";
import { ProjectTitle } from "./projects/ProjectTitle";

interface IProjectData {
  title: string;
  company: string;
  start: string;
  end: string;
  technologies: string[];
  page: string;
  link: string;
  sourceLink: string | undefined;
  description: string;
  slideshowImage: string;
  headingImage: string;
  headingCenterX: number;
  headingCenterY: number;
}
// tslint:disable-next-line:no-var-requires
const projectsData: IProjectData[] = require("./projectsData.json").data;
let projectIdx = 0;
for (let i = 0; i < projectsData.length; ++i) {
  if (window.location.pathname.indexOf(projectsData[i].page) >= 0) {
    projectIdx = i;
    break;
  }
}

// Html/Three.js initialization.
const canvas = document.getElementById("project-canvas") as HTMLCanvasElement;
const links = document.getElementById("project-links") as HTMLCanvasElement;
const title = document.getElementById("project-title") as HTMLDivElement;
const table = document.getElementById("project-table") as HTMLDivElement;
const description = document.getElementById(
  "project-description"
) as HTMLDivElement;
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
    texture: new Uniform(Texture.DEFAULT_IMAGE),
    textureScale: new Uniform(new Vector2(1.0, 1.0)),
    textureCenter: new Uniform(
      new Vector2(
        projectsData[projectIdx].headingCenterX,
        projectsData[projectIdx].headingCenterY
      )
    ),
    opacity: new Uniform(0.0)
  },
  vertexShader: `
        attribute vec2 position;
        varying vec2 vUV;
        varying vec2 vScaledUV;
        uniform vec2 textureScale;
        uniform vec2 textureCenter;

        void main() {
          vUV = position * 0.5 + 0.5;
          vScaledUV = position / textureScale * 0.5 + textureCenter;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
  fragmentShader: `
        precision highp float;
        precision highp int;
        varying vec2 vUV;
        varying vec2 vScaledUV;
        uniform sampler2D texture;
        uniform float opacity;

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
          vec4 color = texture2D(texture, vScaledUV);
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
const texture = new TextureLoader().load(
  projectsData[projectIdx].headingImage,
  (result: Texture) => {
    texture.minFilter = LinearFilter;
    texture.wrapS = MirroredRepeatWrapping;
    texture.wrapT = MirroredRepeatWrapping;
    material.uniforms.texture.value = result;
    fadeInAnimation.play();
  }
);

function animate() {
  requestAnimationFrame(animate);
  if (material.uniforms.texture.value !== undefined) {
    material.uniforms.textureScale.value.set(
      material.uniforms.texture.value.image.width / canvas.offsetWidth,
      material.uniforms.texture.value.image.height / canvas.offsetHeight
    );
  }
  renderer.render(scene, camera);
}

ReactDOM.render(
  <ProjectLinks
    link={projectsData[projectIdx].link}
    sourceLink={projectsData[projectIdx].sourceLink}
  />,
  links
);
ReactDOM.render(<ProjectTitle title={projectsData[projectIdx].title} />, title);
ReactDOM.render(
  <ProjectTable
    company={projectsData[projectIdx].company}
    start={projectsData[projectIdx].start}
    end={projectsData[projectIdx].end}
    technologies={projectsData[projectIdx].technologies}
  />,
  table
);
ReactDOM.render(
  <ProjectDescription description={projectsData[projectIdx].description} />,
  description
);
animate();
