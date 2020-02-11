import anime from "animejs";

type SectionName = "intro" | "about" | "projects" | "contact" | "social";
const enum Sections {
  intro,
  about,
  projects,
  contact,
  social
}

const sectionsOpacity = {
  intro: 0,
  about: 0,
  projects: 0,
  contact: 0,
  social: 0
};

const headings = document.getElementsByTagName("h1");
const lines = document.getElementsByClassName("section-line");

function createSectionAnimation(
  sectionName: SectionName,
  sectionIndex: number
) {
  return anime({
    autoplay: false,
    targets: sectionsOpacity,
    [sectionName]: 1.0,
    duration: 2000,
    easing: "easeOutExpo",
    update: v => {
      (headings[sectionIndex] as HTMLElement).style.opacity = String(
        sectionsOpacity[sectionName]
      );
      (lines[
        sectionIndex
      ] as HTMLElement).style.backgroundColor = `rgba(255, 255, 255, ${sectionsOpacity[sectionName]})`;
    }
  });
}

const sectionsAnimations = [
  createSectionAnimation("intro", Sections.intro),
  createSectionAnimation("about", Sections.about),
  createSectionAnimation("projects", Sections.projects),
  createSectionAnimation("contact", Sections.contact),
  createSectionAnimation("social", Sections.social)
];

export function animate() {
  requestAnimationFrame(animate);
  for (let i = 0; i < headings.length; ++i) {
    const boundingClient = headings[i].getBoundingClientRect();
    const fireAnimation =
      boundingClient.top <= window.innerHeight &&
      boundingClient.bottom > 0 &&
      !sectionsAnimations[i].began;
    if (fireAnimation) {
      sectionsAnimations[i].play();
    }
  }
  return;
}
