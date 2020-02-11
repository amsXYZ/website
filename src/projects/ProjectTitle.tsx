import React from "react";

export const ProjectTitle: React.FunctionComponent<{
  title: string;
}> = props => {
  return <h1>{props.title}</h1>;
};
