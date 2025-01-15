import { userRequest } from "@/utils/requestMethods";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate, useNavigation, useParams } from "react-router-dom";
import { IoDiamondSharp } from "react-icons/io5";
import Image from "../../assets/react.svg";
// import { Button } from "@/components/ui/button";
import ConfirmDelete from "@/components/ConfirmDelete";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function convertToArray(input: string): string[] {
  // Trim whitespace and split the string by commas
  return input?.split(",").map((item) => item?.trim());
}

// Example usage:
const input = "apple, banana, cherry, date";
const result = convertToArray(input);
console.log(result); // Output: ['apple', 'banana', 'cherry', 'date']

const GemDetails = () => {
  const { id } = useParams();
  const navigateTo = useNavigate();

  const getGemDetails = () => {
    return userRequest({
      url: `gemstones/get-gemblog/${id}`,
      method: "get",
    });
  };
  const deleteGemblogMethod = () => {
    return userRequest({
      url: `gemstones/delete-gemblog/${id}`,
      method: "delete",
    });
  };

  const { data } = useQuery("get-gem-details", getGemDetails, {
    onSuccess: () => {
      console.log(data);
    },
    onError: (error: any) => {
      console.log(error);
    },
  });
  const { mutate: deleteGemblog, isLoading } = useMutation(
    "delete-gemblog",
    deleteGemblogMethod,
    {
      onSuccess: (response: any) => {
        if (response?.status !== 200) {
          toast.error("Error Deletig!", {
            position: "bottom-right",
            duration: 2000,
          });
          return;
        }
        toast.success("Deleted!", { position: "bottom-right", duration: 2000 });
        navigateTo("/home/gemblogs");
      },
      onError: (error: any) => {
        console.log(error);
      },
    }
  );

  // console.log(data)

  // Get navigation state for loading indicators
  const navigation = useNavigation();

  const [selectedSection, setSelectedSection] = useState("who-should-wear");

  // const [selectedSection, setSelectedSection] = useState('who-should-wear');

  const navigationItems = [
    { id: "who-should-wear", label: "Who Should Wear?" },
    { id: "benefits", label: "Benefits" },
    { id: "prices", label: "Prices" },
    { id: "quality", label: "Quality" },
    { id: "specifications", label: "Specifications" },
    { id: "faqs", label: "FAQs" },
    { id: "curious-facts", label: "Curious Facts" },
  ];

  if (navigation.state === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading gemstone details...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedSection) {
      case "who-should-wear":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.whoShouldWear }}
          />
        );
      case "benefits":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.benefits }}
          />
        );

      case "quality":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.quality }}
          />
        );

      case "specifications":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.specifications }}
          />
        );

      case "curious-facts":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.curiousFacts }}
          />
        );
      case "prices":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.prices }}
          />
        );
      case "faqs":
        return (
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{ __html: data?.data?.faqs }}
          />
        );

      default:
        return <div>Content coming soon...</div>;
    }
  };

  const benefits = convertToArray(data?.data?.shortBenefits);

  return (
    <div className="flex flex-col w-10/12 mb-20 mx-auto">
       <div className="flex flex-end w-full mt-5">
        <Link to={`/home/gemblogs/edit/${id}`}>
          <Button className="px-2 py-1 ml-auto bg-blue-600 text-white  mb-5">
            Edit Gemstone
          </Button>
        </Link>
      </div>
      <div className="flex justify-between items-center w-10/12 mx-auto mb-8">
        <div className="flex flex-col space-y-4">
          <h1 className="font-medium font-serif text-4xl">
            {data?.data?.name}
          </h1>
          <p className="text-gray-700">{data?.data?.description}</p>

          {/* Benefits icons */}
          <div className="grid grid-cols-4 gap-8 py-6 border-t border-b border-gray-200">
            {benefits?.map((benefit: string) => (
              <div className="flex flex-col items-center text-center space-y-2">
                <IoDiamondSharp className="w-5 h-5 text-red-500" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <img
          src={Image}
          alt="Red Coral Gemstone"
          className="w-64 h-64 object-cover rounded-lg shadow-lg mt-10 ml-20"
        />
      </div>

      <div className="flex space-x-6 border-b mb-6">
        {navigationItems.map((item) => (
          <button
            key={item?.id}
            onClick={() => setSelectedSection(item?.id)}
            className={`px-4 py-2 font-medium transition-colors duration-200 ${
              selectedSection === item.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {item?.label}
          </button>
        ))}
      </div>

      <div className="py-6">{renderContent()}</div>
      <div className="danger">
        {/* <Button className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white">Delete</Button> */}
        {isLoading ? (
          <span className="text-red-600">Deleting....</span>
        ) : (
          <ConfirmDelete onConfirm={deleteGemblog} />
        )}
      </div>
      {/* <GemstoneFilters /> */}
    </div>
  );
};

export default GemDetails;
