"use client";
import React, { useState } from "react";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaRegCheckSquare } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import "./NavBar.css";
import { IconType } from "react-icons";

type MenuItem = {
  name: string;
  colour: string;
  icon:IconType;
};

export default function NavBar() {
  const menuItems: MenuItem[] = [
    { name: "Assign", colour: "#f94144",icon:IoDocumentTextOutline},
    { name: "Tsks", colour: "#f3722c",icon:FaRegCheckSquare},
    { name: "Schedule", colour: "#f8961e",icon:FaRegCalendarAlt },
    { name: "Settings", colour: "#f9c74f",icon:IoSettingsOutline },
  ];
  const customStyle = (
    vars: Record<string, string | number>
  ): React.CSSProperties => vars as React.CSSProperties;
  // using this code as reference https://stackoverflow.com/questions/14184494/segments-in-a-circle-using-css/14185845#14185845
  return (
    <>
      <button className="toggle">menu</button>
      <div className="pie" style={customStyle({ "--n": 16 })}>
        {menuItems.map((item: MenuItem, idx: number) => (
          <div
            className="slice"
            style={customStyle({ "--i": idx, "--c": item.colour })}
          >
            {<item.icon />}
          </div>
        ))}
      </div>
      <span className="tooltiptext">Settings!!!</span>
    </>
  );
}

// export default function NavBar() {
//   const menuItems = ["Assign", "Tsks", "Schedule", "Settings"]
//   const colors = ["red", "blue", "green", "yellow"]
//   const [isOpen, setIsOpen] = useState(false);
//   const centralAngle = 90 / menuItems.length;

//   const transformItem = (idx: number): string => {
//     return `rotate(${centralAngle * idx + 190}deg) skew(${90 - centralAngle}deg)`
//   }

//   const transformInnerContent = (idx: number): string => {
//     return `rotate(${-(90 - (centralAngle * idx / 2) + 90)}deg) skew(${-(90 - centralAngle)}deg)`
//   }

//   return (

//     <>
//       <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
//       <ul style={{ width: "300px", height: "150px", backgroundColor: "grey" }}>
//         {
//           menuItems.map((item, idx) =>
//             <li
//               key={idx}
//               style={{
//                 "display": isOpen ? "block" : "none",
//                 "transform": transformItem(idx),
//               }}
//             >
//               <a style={{
//                 "transform": transformInnerContent(idx)
//                 ,"backgroundColor": colors[idx]
//                 ,position: "absolute"
//                 , textAlign: "center"
//               }}>{item}</a>
//             </li>
//           )
//         }

//       </ul>
//     </>

//   )

// }
