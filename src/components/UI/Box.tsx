import React from 'react';
import './Box.css'; // Import the CSS file for styling

interface BoxProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  transform?: string;
  flexShrink?: string;
  padding?: string;
  alignItems?: string;
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
}

const Box: React.FC<BoxProps> = ({
  width = '100px', // Default width
  height = '100px', // Default height
  background = '#3498db', // Default background color
  borderRadius = '30px',
  transform = 'none',
  flexShrink = '0',
  padding = '0',
  alignItems = 'center',
  flexDirection = 'row',
}) => {
  const boxStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: background,
    borderRadius,
    transform,
    flexShrink,
    padding,
    display: 'inline-flex',
    flexDirection,
    alignItems,
  };

  return <div className="box" style={boxStyle}></div>;
};

export default Box;
