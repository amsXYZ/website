import React from "react";
import ReactDOM from "react-dom";
import { IntroText } from "./IntroText";

const element = document.getElementById("intro-text");
export function animate() {
  requestAnimationFrame(animate);
  const boundingClient = element.getBoundingClientRect();
  const fireAnimation =
    boundingClient.top <= window.innerHeight && boundingClient.bottom > 0;
  if (fireAnimation) {
    ReactDOM.render(<IntroText />, element);
  }
  return;
}
