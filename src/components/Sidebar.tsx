import { tabs } from "@/utils/constants";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  // Helper function to render regular tab buttons
  const renderTabButton = (item) => (
    <Link to={item.link} key={item.tab_name} className="text-left">
      <button
        onClick={() => setActive(item.tab_name)}
        className={`${
          active === item.tab_name && "border border-white rounded-md"
        } text-left pl-5 w-32 py-1`}
      >
        {item.tab_name}
      </button>
    </Link>
  );

  // Helper function to render accordion sub-items
  const renderAccordionItems = (items) => (
    items.map((item) => (
      <Link to={item.link} key={item.tab_name} className="text-left">
        <button
          onClick={() => setActive(item.tab_name)}
          className={`${
            active === item.tab_name && "border border-white rounded-md"
          } text-left pl-8 w-32 py-1 mt-1`}
        >
          {item.tab_name}
        </button>
      </Link>
    ))
  );

  return (
    <div className="pl-2 py-2 h-screen text-white flex flex-col bg-slate-600 text-left justify-start gap-y-2">
      {tabs.map((item) => (
        item.type === "accordion" ? (
          <Accordion
            key={item.tab_name}
            type="single"
            collapsible
            className="w-32"
          >
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="pl-5 py-1 hover:no-underline">
                {item.tab_name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-y-1">
                  {renderAccordionItems(item.items)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          renderTabButton(item)
        )
      ))}
    </div>
  );
};

export default Sidebar;