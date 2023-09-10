import React from "react";

const Navbar = () => {
  return (
    <div className="fixed z-10 bg-white top-0 left-0 w-screen shadow-sm">
      <div className="flex justify-between items-center gap-8 max-w-6xl mx-auto p-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-full" />
          <span className="font-bold">WTOP</span>
        </div>
        <ul className="flex-1"></ul>
        <div></div>
      </div>
    </div>
  );
};

export default Navbar;
