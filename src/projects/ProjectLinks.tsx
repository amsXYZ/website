import React from "react";

export const ProjectLinks: React.FunctionComponent<{
  link: string;
  sourceLink: string | undefined;
}> = props => {
  const sourceLink =
    props.sourceLink !== undefined ? (
      <a rel="noopener" href={props.sourceLink} target="_blank">
        Source Code
      </a>
    ) : (
      <span></span>
    );

  const el0 = sourceLink;
  const el1 = (
    <a rel="noopener" href={props.link} target="_blank">
      Website
    </a>
  );
  return (
    <div className="links-div">
      <strong>{el0}</strong>
      <strong>{el1}</strong>
    </div>
  );
};
