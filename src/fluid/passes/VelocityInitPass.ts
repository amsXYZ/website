import {
  BufferAttribute,
  BufferGeometry,
  HalfFloatType,
  Mesh,
  OrthographicCamera,
  RawShaderMaterial,
  RGBFormat,
  Scene,
  Texture,
  Uniform,
  UnsignedByteType,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget
} from "three";

export class VelocityInitPass {
  public readonly scene: Scene;
  public readonly camera: OrthographicCamera;

  private geometry: BufferGeometry;
  private material: RawShaderMaterial;
  private mesh: Mesh;

  private renderTarget: WebGLRenderTarget;

  constructor(
    readonly renderer: WebGLRenderer,
    readonly resolution: Vector2,
    readonly floatSim: boolean
  ) {
    this.scene = new Scene();
    this.camera = new OrthographicCamera(0, 0, 0, 0, 0, 0);

    this.renderTarget = new WebGLRenderTarget(resolution.x, resolution.y, {
      format: RGBFormat,
      type: floatSim ? HalfFloatType : UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false
    });

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
        2
      )
    );
    this.material = new RawShaderMaterial({
      uniforms: {
        aspect: new Uniform(new Vector2(resolution.x / resolution.y, 1.0))
      },
      defines: !floatSim ? { UINT_TARGET: true } : {},
      vertexShader: `
        attribute vec2 position;
        varying vec2 vUV;
        uniform vec2 aspect;

        void main() {
          vUV = position * aspect;
          gl_Position = vec4(position, 0.0, 1.0);
        }`,
      fragmentShader: `
        precision highp float;
        precision highp int;
        varying vec2 vUV;

        void main() {
          float d = 1.0 - clamp(length(vUV), 0.0, 1.0);
          #ifdef UINT_TARGET
          gl_FragColor = vec4((vUV * d) * 0.5 + 0.5, 0.5, 1.0);
          #else
          gl_FragColor = vec4(vUV * d, 0.0, 1.0);
          #endif
        }`,
      depthTest: false,
      depthWrite: false
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false; // Just here to silence a console error.
    this.scene.add(this.mesh);
  }

  public update(uniforms: any): void {
    if (uniforms.width !== undefined && uniforms.height !== undefined) {
      this.renderTarget.setSize(uniforms.width, uniforms.height);

      const isWider = document.documentElement.clientWidth > window.innerHeight;
      isWider
        ? this.material.uniforms.scale.value.set(
            document.documentElement.clientWidth / window.innerHeight,
            1.0
          )
        : this.material.uniforms.scale.value.set(
            1.0,
            window.innerHeight / document.documentElement.clientWidth
          );
    }
  }

  public render(): Texture {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    return this.renderTarget.texture;
  }
}
