import { tabs } from "@/utils/constants";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  const renderTabButton = (item: any) => (
    <Link to={item.link} key={item.tab_name} className="block w-full">
      <button
        onClick={() => setActive(item.tab_name)}
        className={`
          group relative w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200 flex items-center gap-3
          ${
            active === item.tab_name
              ? "bg-white/10 text-white shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-indigo-400 before:rounded-full"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }
        `}
      >
        {item.icon && (
          <span className={`${active === item.tab_name ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}>
            {item.icon}
          </span>
        )}
        {item.tab_name}
      </button>
    </Link>
  );

  const renderAccordionItems = (items: any) =>
    items.map((item: any) => (
      <Link to={item.link} key={item.tab_name} className="block w-full">
        <button
          onClick={() => setActive(item.tab_name)}
          className={`
            group relative w-full text-left pl-9 pr-4 py-2 rounded-lg text-sm
            transition-all duration-200 flex items-center gap-2
            ${
              active === item.tab_name
                ? "text-white bg-white/10 before:absolute before:left-4 before:top-1/2 before:-translate-y-1/2 before:h-1.5 before:w-1.5 before:bg-indigo-400 before:rounded-full"
                : "text-slate-500 hover:text-slate-200 hover:bg-white/5 before:absolute before:left-4 before:top-1/2 before:-translate-y-1/2 before:h-1 before:w-1 before:bg-slate-600 before:rounded-full"
            }
          `}
        >
          {item.tab_name}
        </button>
      </Link>
    ));

  return (
    <aside className="
      relative flex flex-col w-56 h-screen
      bg-slate-900 border-r border-white/5
      px-3 py-5 gap-1
      before:absolute before:inset-0 before:bg-gradient-to-b before:from-indigo-950/30 before:to-transparent before:pointer-events-none
    ">
      {/* Logo / Brand */}
      <div className="px-4 pb-5 mb-1 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {tabs.map((item) =>
          item.type === "accordion" ? (
            <Accordion
              key={item.tab_name}
              type="single"
              collapsible
              className="w-full"
            >
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  className={`
                    group w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200 flex items-center gap-3
                    hover:no-underline [&>svg]:hidden
                    ${
                      item.items?.some((i: any) => i.tab_name === active)
                        ? "text-white bg-white/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {item?.icon && (
                      <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                        {item?.icon}
                      </span>
                    )}
                    {item.tab_name}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-0.5">
                  <div className="flex flex-col gap-0.5 ml-1">
                    {renderAccordionItems(item.items)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            renderTabButton(item)
          )
        )}
      </nav>

      {/* Footer */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="h-7 w-7 rounded-full bg-slate-700 ring-1 ring-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-slate-300 text-xs font-medium">U</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-200 text-xs font-medium truncate">User Name</span>
            <span className="text-slate-500 text-xs truncate">user@email.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;