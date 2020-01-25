import { LinearFilter, Texture, TextureLoader } from "three";

interface ISlideData {
  title: string;
  link: string;
  image: string;
  quote: string;
  authorName: string;
  authorTitle: string;
}

export const SlidesData: ISlideData[] = [
  {
    title: "The Forge",
    link: "https://github.com/ConfettiFX/The-Forge",
    image: "../resources/slide-confetti.png",
    quote:
      "Andrés worked at Confetti for a year. He took care of our macOS / iOS build, helped to write WebGL 2 code, supported our VR initiatives and showed a super proactive and positive attitude. He finished his tasks always in a surprisingly short amount of time, faced many new challenges and overcame them quickly. I am confident that he will be an awesome asset for every company that is looking for a great graphics programmer.",
    authorName: "Wolfgang Engel",
    authorTitle: "CEO & Co-Founder at Confetti"
  },
  {
    title: "HARP.GL",
    link: "https://github.com/heremaps/harp.gl",
    image: "../resources/slide-harp.png",
    quote:
      "I have had the pleasure of working with Andrés for roughly a year. During this time, he has been a key contributor of the open source project https://harp.gl He is very proactive, easy to approach and eager to learn new things. He does not hesitate to ask difficult questions and tackle difficult problems. He contributes as well to good team atmosphere by being easy going. I can only recommend Andrés to any employer looking for talent in the world of Graphics programming.",
    authorName: "Ignacio Julve Castro",
    authorTitle: "Sr. Software Engineering Manager at HERE Technologies"
  }
];

export function getMaxTitleLength(): number {
  let max = -Infinity;
  for (const slide of SlidesData) {
    max = Math.max(max, slide.title.length);
  }
  return max;
}

export function getMaxQuoteLength(): number {
  let max = -Infinity;
  for (const slide of SlidesData) {
    max = Math.max(max, slide.quote.length);
  }
  return max;
}

export function getMaxAuthorNameLength(): number {
  let max = -Infinity;
  for (const slide of SlidesData) {
    max = Math.max(max, slide.authorName.length);
  }
  return max;
}

export function getMaxAuthorTitleLength(): number {
  let max = -Infinity;
  for (const slide of SlidesData) {
    max = Math.max(max, slide.authorTitle.length);
  }
  return max;
}

export function getTextures(): Texture[] {
  const result = [];
  for (let i = 0; i < SlidesData.length; ++i) {
    result.push(Texture.DEFAULT_IMAGE);
    const textureLoader = new TextureLoader().load(
      SlidesData[i].image,
      texture => {
        texture.minFilter = LinearFilter;
        result[i] = texture;
      }
    );
  }
  return result;
}
