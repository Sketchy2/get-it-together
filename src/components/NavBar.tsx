"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ToolTip from "@/components/common/ToolTip";
import { MdOutlineMenu } from "react-icons/md";
import { IoHome } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaRegCheckSquare } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import "./NavBar.css";
import { IconType } from "react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion,AnimatePresence } from "motion/react"
import { it } from "node:test";

type MenuItem = {
  name: string;
  colour: string;
  icon: IconType;
  href: string;
};

export default function NavBar() {
  const menuItems: MenuItem[] = [
    {
      name: "Assignment",
      colour: "#B55629",
      icon: IoDocumentTextOutline,
      href: "/assignment",
    },
    { name: "Tasks", colour: "#3E4578", icon: FaRegCheckSquare, href: "/task" },
    {
      name: "Schedule",
      colour: "#647A67",
      icon: FaRegCalendarAlt,
      href: "/schedule",
    },
    {
      name: "Settings",
      colour: "#DD992B",
      icon: IoSettingsOutline,
      href: "/setting",
    },
  ];

  const customStyle = (
    vars: Record<string, string | number>
  ): React.CSSProperties => vars as React.CSSProperties;

  const router = useRouter();
  const menuRef = useRef<Map<number,HTMLDivElement|null>>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(-1); //tracks which menuitem if any are hovered


  const pathname = usePathname();

  useEffect(() => {
    router.prefetch('/assignment');
    router.prefetch('/task');
    router.prefetch('/schedule');
    router.prefetch('/setting');
    setMenuOpen(false); // Close the navigation panel when route changes
  }, [pathname]);

  // using this code as reference https://stackoverflow.com/questions/14184494/segments-in-a-circle-using-css/14185845#14185845
  return (
    <>
      <button
        className="toggle"
        onClick={
          menuOpen ? () => {router.push("/home");setMenuOpen(!menuOpen)} : () => setMenuOpen(!menuOpen)
        }
      >
        {menuOpen ? (
          <IoHome color="black" size={28} />
        ) : (
          <MdOutlineMenu color="black" size={28} />
        )}
      </button>
      <div
        className="pie"
        style={customStyle({
          "--n": 16,
          opacity: menuOpen ? 1 : 0 
        })}
      >
<AnimatePresence>
  {menuOpen &&
    menuItems.map((item: MenuItem, idx: number) => (
      <div //https://stackoverflow.com/questions/75815089/how-can-i-use-nextjs-link-component-with-framer-motion-in-typescript
        key={idx}
        onClick={()=>router.push(item.href)}
        className="slice"
        style={customStyle({ "--i": idx, "--c": item.colour })}
        onMouseEnter={() => setHovered(idx)}
        onMouseLeave={() => setHovered(-1)}
        title={item.name}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.3, y: 20 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >

            <item.icon />
        </motion.div>

      </div>
    ))}
</AnimatePresence>


      </div>
      {menuOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}

         className="overlay" onClick={() => setMenuOpen(false)}/>
      )}
    </>
  );
}
