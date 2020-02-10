import { LinearFilter, Texture, TextureLoader } from "three";

interface ISlideData {
  title: string;
  link: string;
  image: string;
}

export const SlidesData: ISlideData[] = [
  {
    title: "Digital Dreams",
    link: "https://www.digitaldreamsgames.com",
    image: "../resources/slide-digitaldreams.png"
  },
  {
    title: "StarVR",
    link: "https://www.starvr.com",
    image: "../resources/slide-starvr.png"
  },
  {
    title: "Amazon Sumerian",
    link: "https://aws.amazon.com/sumerian/",
    image: "../resources/slide-sumerian.png"
  },
  {
    title: "The Forge",
    link: "https://theforge.dev",
    image: "../resources/slide-confetti.png"
  },
  {
    title: "HARP.GL",
    link: "https://www.harp.gl",
    image: "../resources/slide-harp.png"
  }
];

export function getMaxTitleLength(): number {
  let max = -Infinity;
  for (const slide of SlidesData) {
    max = Math.max(max, slide.title.length);
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
