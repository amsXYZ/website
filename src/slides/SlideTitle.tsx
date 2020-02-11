import React, { CSSProperties } from "react";

const divStyle: CSSProperties = {
  display: "flex",
  width: "100%",
  height: "150px",
  marginTop: "-150px",
  alignItems: "flex-end"
};

export const SlideTitle: React.FunctionComponent<{
  title: string;
  page: string;
}> = props => {
  const href = `./projects/${props.page}.html`;
  return (
    <div style={divStyle}>
      <a rel="noopener" href={href} className="project-link">
        {props.title}
      </a>
    </div>
  );
};
