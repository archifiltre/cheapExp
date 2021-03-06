import React, { PureComponent } from "react";

export default class SvgRectangle extends PureComponent {
  render() {
    const props = this.props;
    const x = props.x;
    const y = props.y;
    const dx = props.dx;
    const dy = props.dy;
    const onClickHandler = props.onClickHandler;
    const onDoubleClickHandler = props.onDoubleClickHandler;
    const onMouseOverHandler = props.onMouseOverHandler;
    const fill = props.fill;
    const opacity = props.opacity;
    const stroke = props.stroke;
    const cursor = props.cursor;

    return (
      <rect
        className="node"
        x={x}
        y={y}
        width={dx}
        height={dy}
        onClick={onClickHandler}
        onDoubleClick={onDoubleClickHandler}
        onMouseOver={onMouseOverHandler}
        style={{ fill, opacity, stroke, cursor }}
      />
    );
  }
}
