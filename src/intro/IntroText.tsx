import React, { useEffect, useState } from "react";

interface ITypedLine {
  text: string;
  speed: number;
  fullstop: number;
  strong: number[];
}

const typedText: ITypedLine[] = [
  {
    text: "Hi, I'm Andrés Valencia Téllez,",
    speed: 33,
    fullstop: 500,
    strong: [8, 29]
  },
  {
    text: "Freelance Software Engineer,",
    speed: 33,
    fullstop: 500,
    strong: [0, 26]
  },
  {
    text: "and this is my professional portfolio website.",
    speed: 33,
    fullstop: 1000,
    strong: []
  }
];

function formatStrongText(line: ITypedLine, end?: number) {
  if (line.strong.length === 0) {
    return line.text.substring(0, end);
  }
  if (end === undefined) {
    end = line.text.length;
  }

  const preStrongEndIdx = Math.min(line.strong[0], end);
  const strongStartIdx = Math.min(line.strong[0], end);
  const strongEndIdx = Math.min(line.strong[1] + 1, end);
  const postStrongStartIdx = Math.min(line.strong[1] + 1, end);

  const preStrongText = line.text.substring(0, preStrongEndIdx);
  const strongText = line.text.substring(strongStartIdx, strongEndIdx);
  const postStrongText = line.text.substring(postStrongStartIdx, end);

  return (
    <span>
      {preStrongText}
      <strong>{strongText}</strong>
      {postStrongText}
    </span>
  );
}

const formatedFullLines = typedText.map((value, index) => {
  return (
    <span key={index}>
      {formatStrongText(typedText[index])}
      <br />
    </span>
  );
});

export const IntroText: React.FunctionComponent<{}> = props => {
  const [line, setLine] = useState(0);
  const [char, setChar] = useState(0);

  useEffect(() => {
    if (line !== typedText.length) {
      const timer = setTimeout(
        () => {
          if (char === typedText[line].text.length) {
            setLine(line + 1);
            setChar(0);
          } else {
            setChar(char + 1);
          }
        },
        char === typedText[line].text.length
          ? typedText[line].fullstop
          : typedText[line].speed
      );
    }
  }, [char]);

  const fullLines = formatedFullLines.map((value, index) => {
    return index < line ? value : undefined;
  });
  const currentLine =
    line !== typedText.length
      ? formatStrongText(typedText[line], char)
      : undefined;
  return (
    <span>
      {fullLines}
      {currentLine}
    </span>
  );
};
