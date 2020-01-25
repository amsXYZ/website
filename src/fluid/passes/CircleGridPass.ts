import {
  BufferGeometry,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Mesh,
  RawShaderMaterial,
  Scene,
  Texture,
  Uniform,
  Vector2,
  WebGLRenderer
} from "three";

const QuadVertices: number[][] = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.5],
  [0.5, 0.5],
  [-0.5, 0.5],
  [-0.5, -0.5]
];

const configurationSize = 1024;

export class CircleGridPass {
  public readonly scene: Scene;

  private geometry: BufferGeometry;
  private material: RawShaderMaterial;
  private mesh: Mesh;

  constructor(
    readonly renderer: WebGLRenderer,
    readonly resolution: Vector2,
    readonly dotSize: number,
    readonly isMobile: boolean,
    readonly floatSim: boolean
  ) {
    this.scene = new Scene();

    const vertexBuffer = new InterleavedBuffer(
      new Float32Array(
        this.computeDebugVertexBuffer(resolution.x, resolution.y)
      ),
      6
    );
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new InterleavedBufferAttribute(vertexBuffer, 4, 0)
    );
    this.geometry.setAttribute(
      "uv",
      new InterleavedBufferAttribute(vertexBuffer, 2, 4)
    );
    this.material = new RawShaderMaterial({
      uniforms: {
        vectorField: new Uniform(Texture.DEFAULT_IMAGE),
        resolution: new Uniform(resolution),
        scaleRange: new Uniform(new Vector2(0.3, 1.0))
      },
      defines: !floatSim ? { UINT_TARGET: true } : {},
      vertexShader: `    
        attribute vec4 position;
        attribute vec2 uv;
        varying vec2 vPos;
        varying float vScale;
        uniform sampler2D vectorField;
        uniform vec2 scaleRange;

        void main() {
          vPos = position.zw;

          vec3 vectorSample = texture2D(vectorField, uv).xyz;
          #ifdef UINT_TARGET
          vectorSample = vectorSample * 2.0 - 1.0;
          #endif
          vScale = clamp(length(vectorSample), scaleRange.x, scaleRange.y);

          vec2 pos = vScale * position.xy + vectorSample.xy * 0.1;
          gl_Position = vec4(pos + (uv * 2.0 - 1.0), 0.0, 1.0);
        }`,
      fragmentShader: `
        precision highp float;
        precision highp int;
        varying vec2 vPos;
        varying float vScale;
        uniform vec2 colorRange;
        uniform vec2 resolution;
        
        void main() {
          float d = clamp(1.0 - length(vPos) * 2.0, 0.0, 1.0);

          vec3 color = vec3(vScale);
          float alpha = pow(d, 0.5);

          float verticalFade = clamp(gl_FragCoord.y / resolution.y * 10.0, 0.0, 1.0);

          gl_FragColor = vec4(color, alpha * verticalFade);
        }`,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      extensions: {
        derivatives: true
      }
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  public update(uniforms: any): void {
    if (uniforms.vectorField) {
      this.material.uniforms.vectorField.value = uniforms.vectorField;
    }
    if (uniforms.width !== undefined && uniforms.height !== undefined) {
      const vertexBuffer = new InterleavedBuffer(
        new Float32Array(
          this.computeDebugVertexBuffer(uniforms.width, uniforms.height)
        ),
        6
      );
      this.geometry.dispose();
      this.geometry.setAttribute(
        "position",
        new InterleavedBufferAttribute(vertexBuffer, 4, 0)
      );
      this.geometry.setAttribute(
        "uv",
        new InterleavedBufferAttribute(vertexBuffer, 2, 4)
      );
      this.scene.remove(this.mesh);
      this.mesh = new Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);
    }
  }

  private computeDebugVertexBuffer(width: number, height: number): number[] {
    const size = Math.max(
      (this.dotSize * (this.isMobile ? Math.min(width, height) : height)) /
        configurationSize,
      4.0
    );
    const vertexBuffer: number[] = [];
    for (let i = size / 2; i < height + size; i += size) {
      for (let j = size / 2; j < width + size; j += size) {
        for (let k = 0; k < 6; k++) {
          vertexBuffer.push(
            (size / height) * QuadVertices[k][0] * (height / width),
            (size / height) * QuadVertices[k][1],
            QuadVertices[k][0],
            QuadVertices[k][1],
            j / width,
            i / height
          );
        }
      }
    }
    return vertexBuffer;
  }
}
