import { tabs } from "@/utils/constants";
import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="pl-2 py-2 flex flex-col items-start justify-start gap-y-2">
      {tabs.map((item: any) => (
        <Link to={item.link}>
          <button
            onClick={() => {
              setActive(item?.tab_name);
            }}
            className={`${active===item.tab_name && `border  border-blue-700 rounded-md`} w-32 py-1`}
          >
            {item?.tab_name}
          </button>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
