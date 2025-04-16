"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ToolTip from "@/components/ToolTip";
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
  const menuRef = useRef<Map<number, HTMLElement | null> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(-1); //tracks which menuitem if any are hovered

  function getMap() {
    if (!menuRef.current) {
      menuRef.current = new Map();
    }
    return menuRef.current;
  }
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false); // Close the navigation panel when route changes
  }, [pathname]);

  // using this code as reference https://stackoverflow.com/questions/14184494/segments-in-a-circle-using-css/14185845#14185845
  return (
    <>
      <button
        className="toggle"
        onClick={
          menuOpen ? () => router.push("/home") : () => setMenuOpen(!menuOpen)
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
          visibility: menuOpen ? "visible" : "hidden",
        })}
      >
        {menuItems.map((item: MenuItem, idx: number) => (
          <Link
            key={idx}
            href={{ pathname: item.href }}
            className="slice"
            style={customStyle({ "--i": idx, "--c": item.colour })}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(-1)}
          >
            <div
              ref={(node) => {
                const refs = getMap();
                refs.set(idx, node);

                return () => {
                  refs.delete(idx);
                };
              }}
            >
              <item.icon />
            </div>

            {hovered == idx && (
              <ToolTip content={item.name} targetRef={getMap().get(idx)} />
            )}
          </Link>
        ))}
      </div>
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}></div>
      )}
    </>
  );
}
