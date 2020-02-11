import React, { CSSProperties } from "react";

export const ProjectTable: React.FunctionComponent<{
  company: string;
  start: string;
  end: string;
  technologies: string[];
}> = props => {
  let technologies = "";
  for (let i = 0; i < props.technologies.length; ++i) {
    technologies += props.technologies[i];
    if (i !== props.technologies.length - 1) {
      technologies += ", ";
    }
  }

  return (
    <div>
      <div className="table-div">
        <strong>Company:</strong>
        {props.company}
        <strong>Start Date:</strong>
        {props.start}
        <strong>End Date:</strong>
        {props.end}
        <strong>Technologies:</strong>
        {technologies}
      </div>
    </div>
  );
};
