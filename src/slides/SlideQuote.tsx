import React from "react";

export const SlideQuote: React.FunctionComponent<{
  quote: string;
  author: string;
  title: string;
}> = props => {
  return (
    <span>
      <em>"{props.quote}"</em>
      <br />
      <br />
      <strong>{props.author}</strong>, {props.title}
    </span>
  );
};
