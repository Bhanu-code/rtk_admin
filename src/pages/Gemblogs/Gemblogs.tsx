// import GemstoneForm from "@/components/GemstoneForm"

import { userRequest } from "@/utils/requestMethods";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import Image from "../../assets/react.svg";
import { Button } from "@/components/ui/button";

// interface GemstoneData {
//   name: string;
//   description: string;
//   whoShouldWear: string;
//   benefits: string;
//   prices: string;
//   quality: string;
//   specifications: string;
//   curiousFacts: string;
//   faqs: string;
// }

const Gemblogs = () => {
  const getAllGems = () => {
    return userRequest({
      url: `/gemstones/get-all-gemblog/`,
      method: "get",
    });
  };

  const { data: gemblogs } = useQuery("get-all-gems", getAllGems, {
    onSuccess: () => {
      console.log(gemblogs);
    },
    onError: (error: any) => {
      console.log(error);
    },
  });

  return (
    <div className="p-3">
      {/* <GemstoneForm/> */}
      <div className="flex flex-end">
        <Link to="/home/gemblogs/add">
          <Button className="px-2 py-1 ml-auto bg-blue-600 text-white mb-10 fixed">
            Add Gemstone
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-x-10 gap-y-5 m-5 mt-10">
        {gemblogs?.data?.map((item: any) => (
          <Link to={`/home/gemblogs/${item?.id}`}>
            <div className="shadow-none transition-all duration-300">
              <div className="p-2">
                <div className=" overflow-hidden ">
                  <img
                    src={Image}
                    alt="alte"
                    className="size-44 object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <h3 className="mt-3 text-lg montserrat-regular text-center text-gray-800">
                    {item?.name}
                  </h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Gemblogs;
