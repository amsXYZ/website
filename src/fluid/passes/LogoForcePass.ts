import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  RawShaderMaterial,
  Scene,
  Texture,
  Uniform,
  Vector2
} from "three";

export class LogoForcePass {
  public readonly scene: Scene;

  private material: RawShaderMaterial;
  private mesh: Mesh;

  constructor(
    readonly resolution: Vector2,
    scale: number,
    readonly floatSim: boolean
  ) {
    this.scene = new Scene();

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
        2
      )
    );
    this.material = new RawShaderMaterial({
      uniforms: {
        scale: new Uniform(scale),
        aspect: new Uniform(new Vector2(resolution.x / resolution.y, 1.0)),
        logo: new Uniform(Texture.DEFAULT_IMAGE),
        opacity: new Uniform(0.0)
      },
      defines: !floatSim ? { UINT_TARGET: true } : {},
      vertexShader: `
        attribute vec2 position;
        varying vec2 vUV;
        uniform float scale;
        uniform vec2 aspect;

        void main() {
          vUV = position * aspect / scale;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
      fragmentShader: `
        precision highp float;
        precision highp int;
        varying vec2 vUV;
        uniform sampler2D logo;
        uniform float opacity;

        void main() {
          float value = texture2D(logo, vUV + 0.5).r;
          #ifdef UINT_TARGET
          gl_FragColor = vec4(0.5, 0.5, value, value * opacity);
          #else
          gl_FragColor = vec4(0.0, 0.0, value, value * opacity);
          #endif
        }`,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.frustumCulled = false; // Just here to silence a console error.
    this.scene.add(this.mesh);
  }

  public update(uniforms: any): void {
    if (uniforms.scale) {
      this.material.uniforms.scale.value = uniforms.scale;
    }
    if (uniforms.aspect) {
      this.material.uniforms.aspect.value = uniforms.aspect;
    }
    if (uniforms.opacity) {
      this.material.uniforms.opacity.value = uniforms.opacity;
    }
    if (uniforms.logo) {
      this.material.uniforms.logo.value = uniforms.logo;
    }
  }
}
