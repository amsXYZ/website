import anime from "animejs";
import {
  HalfFloatType,
  OrthographicCamera,
  RGBFormat,
  Texture,
  TextureLoader,
  UnsignedByteType,
  Vector2,
  Vector4,
  WebGLRenderer
} from "three";
import { AdvectionPass } from "./passes/AdvectionPass";
import { BoundaryPass } from "./passes/BoundaryPass";
import { CircleGridPass } from "./passes/CircleGridPass";
import { DivergencePass } from "./passes/DivergencePass";
import { GradientSubstractionPass } from "./passes/GradientSubstractionPass";
import { JacobiIterationsPass } from "./passes/JacobiIterationsPass";
import { LogoForcePass } from "./passes/LogoForcePass";
import { TouchForcePass } from "./passes/TouchForcePass";
import { VelocityInitPass } from "./passes/VelocityInitPass";
import { RenderTarget } from "./RenderTarget";

function mobileCheck() {
  let check = false;
  (a => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    ) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor);
  return check;
}

function firefoxCheck() {
  return navigator.vendor === "";
}

// App configuration options.
const isMobile = mobileCheck();
const configuration = {
  Iterations: 8,
  Radius: 0.3,
  Scale: 0.5,
  DotSize: isMobile ? 16.0 : 8.0
};

// Html/Three.js initialization.
const canvas = document.getElementById("logo-canvas") as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas });
renderer.autoClear = false;
renderer.setSize(document.documentElement.clientWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new OrthographicCamera(0, 0, 0, 0, 0, 0);
const dt = 1 / 60;

// Check floating point texture support.
let floatSimSupported = !firefoxCheck();
if (
  !(
    renderer.getContext().getExtension("OES_texture_half_float") &&
    renderer.getContext().getExtension("OES_texture_half_float_linear")
  )
) {
  floatSimSupported = false;
}

const resolution = new Vector2(
  (configuration.Scale * document.documentElement.clientWidth) /
    window.devicePixelRatio,
  (configuration.Scale * window.innerHeight) / window.devicePixelRatio
);
const aspect = new Vector2(resolution.x / resolution.y, 1.0);

// RenderTargets initialization.
let velocityRT: RenderTarget;
let divergenceRT: RenderTarget;
let pressureRT: RenderTarget;
if (floatSimSupported) {
  velocityRT = new RenderTarget(resolution, 2, RGBFormat, HalfFloatType);
  divergenceRT = new RenderTarget(resolution, 1, RGBFormat, HalfFloatType);
  pressureRT = new RenderTarget(resolution, 2, RGBFormat, HalfFloatType);
} else {
  velocityRT = new RenderTarget(resolution, 2, RGBFormat, UnsignedByteType);
  divergenceRT = new RenderTarget(resolution, 1, RGBFormat, UnsignedByteType);
  pressureRT = new RenderTarget(resolution, 2, RGBFormat, UnsignedByteType);
}

// These variables are used to store the result the result of the different
// render passes. Not needed but nice for convenience.
let v: Texture;
let d: Texture;
let p: Texture;

// Render passes initialization.
const velocityInitPass = new VelocityInitPass(
  renderer,
  resolution,
  floatSimSupported
);
const velocityInitTexture = velocityInitPass.render();
const velocityAdvectionPass = new AdvectionPass(
  velocityInitTexture,
  velocityInitTexture,
  floatSimSupported
);
const logoForcePass = new LogoForcePass(
  new Vector2(document.documentElement.clientWidth, window.innerHeight),
  Math.min(1.0, document.documentElement.clientWidth / (512 + 30 + 30)),
  floatSimSupported
);
const touchForceAdditionPass = new TouchForcePass(
  resolution,
  configuration.Radius
);
const velocityBoundary = new BoundaryPass(floatSimSupported);
const velocityDivergencePass = new DivergencePass(floatSimSupported);
const pressurePass = new JacobiIterationsPass(floatSimSupported);
const pressureSubstractionPass = new GradientSubstractionPass(
  floatSimSupported
);
const gridPass = new CircleGridPass(
  renderer,
  new Vector2(document.documentElement.clientWidth, window.innerHeight),
  configuration.DotSize,
  isMobile,
  floatSimSupported
);

// Hint animation.
const hintAnimation = anime({
  autoplay: false,
  targets: "#tap-hint",
  opacity: [{ value: 1.0, duration: 1000 }],
  easing: "easeOutBounce"
});

// Logo animation.
const logoProps = {
  opacity: 0.0
};
const logoAnimation = anime({
  targets: logoProps,
  opacity: [{ value: 1.0, duration: 5000 }],
  easing: "easeOutBounce",
  update: () => {
    logoForcePass.update({ opacity: logoProps.opacity });
  },
  complete: () => {
    if (isMobile) {
      hintAnimation.play();
    }
  }
});
const textureLoader = new TextureLoader().load(
  "../resources/AMS-SDF.png",
  texture => {
    logoForcePass.update({ logo: texture });
    logoAnimation.play();
  }
);

// Event listeners (resizing and mouse/touch input).
window.addEventListener("resize", (event: UIEvent) => {
  renderer.setSize(document.documentElement.clientWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  resolution.set(
    (configuration.Scale * document.documentElement.clientWidth) /
      window.devicePixelRatio,
    (configuration.Scale * window.innerHeight) / window.devicePixelRatio
  );
  velocityRT.resize(resolution);
  divergenceRT.resize(resolution);
  pressureRT.resize(resolution);

  gridPass.update({
    width: document.documentElement.clientWidth,
    height: window.innerHeight
  });

  aspect.set(resolution.x / resolution.y, 1.0);
  logoForcePass.update({
    scale: Math.min(
      1.0,
      document.documentElement.clientWidth / (512 + 30 + 30)
    ),
    aspect
  });
  touchForceAdditionPass.update({ aspect });
});

// Scroll animation.
const scrollParams = {
  y: window.scrollY
};
let canFireScroll = true;
canvas.addEventListener("dblclick", (event: MouseEvent) => {
  if (canFireScroll) {
    canFireScroll = false;
    scrollParams.y = window.scrollY;
    anime({
      autoplay: true,
      targets: scrollParams,
      y: [{ value: document.documentElement.clientHeight, duration: 1000 }],
      easing: "easeInOutCubic",
      update: () => {
        window.scroll({
          top: scrollParams.y
        });
      },
      complete: () => {
        canFireScroll = true;
        if (isMobile) {
          hintAnimation.reverse();
          hintAnimation.play();
        }
      }
    });
  }
});

// Mouse/Touch events.
interface ITouchInput {
  id: string | number;
  input: Vector4;
}

let inputTouches: ITouchInput[] = [];
const mousePositions: Vector2[] = [];
const mouseVelocity: Vector2 = new Vector2();
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  const x = (event.clientX / canvas.clientWidth) * aspect.x;
  const y = 1.0 - (event.clientY + window.scrollY) / canvas.clientHeight;
  if (mousePositions.length === 0) {
    mousePositions.push(new Vector2(x, y), new Vector2(x, y));
  } else {
    mousePositions[1].set(x, y);
  }
});

canvas.addEventListener("touchstart", (event: TouchEvent) => {
  for (const touch of event.changedTouches) {
    const x = (touch.clientX / canvas.clientWidth) * aspect.x;
    const y = 1.0 - (touch.clientY + window.scrollY) / canvas.clientHeight;
    inputTouches.push({
      id: touch.identifier,
      input: new Vector4(x, y, 0, 0)
    });
  }
});

canvas.addEventListener("touchmove", (event: TouchEvent) => {
  event.preventDefault();
  for (const touch of event.changedTouches) {
    const registeredTouch = inputTouches.find(value => {
      return value.id === touch.identifier;
    });
    if (registeredTouch !== undefined) {
      const x = (touch.clientX / canvas.clientWidth) * aspect.x;
      const y = 1.0 - (touch.clientY + window.scrollY) / canvas.clientHeight;
      registeredTouch.input
        .setZ(x - registeredTouch.input.x)
        .setW(y - registeredTouch.input.y);
      registeredTouch.input.setX(x).setY(y);
    }
  }
});

canvas.addEventListener("touchend", (event: TouchEvent) => {
  for (const touch of event.changedTouches) {
    const registeredTouch = inputTouches.find(value => {
      return value.id === touch.identifier;
    });
    if (registeredTouch !== undefined) {
      inputTouches = inputTouches.filter(value => {
        return value.id !== registeredTouch.id;
      });
    }
  }
});

canvas.addEventListener("touchcancel", (event: TouchEvent) => {
  for (let i = 0; i < inputTouches.length; ++i) {
    for (let j = 0; j < event.touches.length; ++j) {
      if (inputTouches[i].id === event.touches.item(j).identifier) {
        break;
      } else if (j === event.touches.length - 1) {
        inputTouches.splice(i--, 1);
      }
    }
  }
});

// Render loop.
function render() {
  const boundingClient = canvas.getBoundingClientRect();
  if (boundingClient.top > -window.innerHeight) {
    // Play logo animation at the beginning.
    if (!logoAnimation.completed) {
      logoAnimation.play();
    }

    // Advect the velocity vector field.
    velocityAdvectionPass.update({ timeDelta: dt });
    v = velocityRT.set(renderer);
    renderer.render(velocityAdvectionPass.scene, camera);

    // Add logo force.
    renderer.render(logoForcePass.scene, camera);

    let input = inputTouches;
    // Mouse input.
    if (mousePositions.length !== 0 && !isMobile) {
      mouseVelocity.copy(mousePositions[1]).sub(mousePositions[0]);
      mousePositions[0].copy(mousePositions[1]);
      input = [
        {
          id: "mouse",
          input: new Vector4(
            mousePositions[1].x,
            mousePositions[1].y,
            mouseVelocity.x,
            mouseVelocity.y
          )
        }
      ];
    }

    // Touch input.
    if (input.length > 0) {
      touchForceAdditionPass.update({
        touches: input,
        radius: configuration.Radius,
        velocity: v
      });
      v = velocityRT.set(renderer);
      renderer.render(touchForceAdditionPass.scene, camera);
    }

    // Add velocity boundaries (simulation walls).
    velocityBoundary.update({ velocity: v });
    v = velocityRT.set(renderer);
    renderer.render(velocityBoundary.scene, camera);

    // Compute the divergence of the advected velocity vector field.
    velocityDivergencePass.update({
      timeDelta: dt,
      velocity: v
    });
    d = divergenceRT.set(renderer);
    renderer.render(velocityDivergencePass.scene, camera);

    // Compute the pressure gradient of the advected velocity vector field (using
    // jacobi iterations).
    pressurePass.update({ divergence: d });
    for (let i = 0; i < configuration.Iterations; ++i) {
      p = pressureRT.set(renderer);
      renderer.render(pressurePass.scene, camera);
      pressurePass.update({ previousIteration: p });
    }

    // Substract the pressure gradient from to obtain a velocity vector field with
    // zero divergence.
    pressureSubstractionPass.update({
      timeDelta: dt,
      velocity: v,
      pressure: p
    });
    v = velocityRT.set(renderer);
    renderer.render(pressureSubstractionPass.scene, camera);

    // Feed the input of the advection passes with the last advected results.
    velocityAdvectionPass.update({
      inputTexture: v,
      velocity: v
    });

    // Render to the main framebuffer the desired visualization.
    renderer.setRenderTarget(null);
    gridPass.update({ vectorField: v });
    renderer.render(gridPass.scene, camera);
  } else {
    logoAnimation.pause();
  }
}
export function animate() {
  requestAnimationFrame(animate);
  render();
}
