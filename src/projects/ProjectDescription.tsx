import React from "react";

function createParagraphMarkup(html: string) {
  return { __html: "<p>" + html + "</p>" };
}

export const ProjectDescription: React.FunctionComponent<{
  description: string;
}> = props => {
  return (
    <div
      dangerouslySetInnerHTML={createParagraphMarkup(props.description)}
    ></div>
  );
};
