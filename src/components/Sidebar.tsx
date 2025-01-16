import { tabs } from "@/utils/constants";
import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="pl-2 py-2 h-screen text-white flex flex-col bg-slate-600 text-left justify-start gap-y-2">
      {tabs.map((item: any) => (
        <Link to={item.link} className="text-left">
          <button
            onClick={() => {
              setActive(item?.tab_name);
            }}
            className={`${active===item.tab_name && `border  border-white rounded-md`} text-left pl-5 w-32 py-1`}
          >
            {item?.tab_name}
          </button>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
