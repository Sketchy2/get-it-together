"use client"
import React, { useState } from 'react'
import "./NavBar.css"

export default function NavBar(){
    const menuItems = ["Assign", "Tsks", "Schedule", "Settings"]

  return(
    <>
<div className="palette">
  <div className="color1"></div>
  <div className="color2"></div>
  <div className="color3"></div>
  <div className="color4"></div>
  <div className="color5"></div>
</div>
</>
  )
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
