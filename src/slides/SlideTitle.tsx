import React from "react";

export const SlideTitle: React.FunctionComponent<{
  title: string;
  link: string;
}> = props => {
  return (
    <a
      rel="noopener"
      href={props.link}
      target="_blank"
      className="project-link"
    >
      {props.title}
    </a>
  );
};
