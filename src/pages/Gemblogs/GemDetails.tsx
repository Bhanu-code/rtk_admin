import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoDiamondSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import ConfirmDelete from "@/components/ConfirmDelete";
import { toast } from "sonner";
import { Loader2, Edit3, ArrowLeft } from "lucide-react";
import Image from "../../assets/react.svg";
import { userRequest } from "@/utils/requestMethods";

const GemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSection, setSelectedSection] = useState("who-should-wear");

  const getGemDetails = async () => {
    const response = await userRequest({
      url: `/gemstones/${id}`,           // Updated to match your new Next.js route
      method: "GET",
    });
    return response;
  };

  const deleteGemblogMethod = async () => {
    return userRequest({
      url: `/gemstones/${id}`,
      method: "DELETE",
    });
  };

  const { data: response, isLoading: isDataLoading } = useQuery(
    ["get-gem-details", id],
    getGemDetails,
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  const gemData = response?.data || response;

  const deleteMutation = useMutation(deleteGemblogMethod, {
    onSuccess: () => {
      toast.success("Gemstone deleted successfully", {
        position: "bottom-right",
      });
      queryClient.invalidateQueries("get-all-gems");
      navigate("/home/gemblogs");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete gemstone", {
        position: "bottom-right",
      });
    },
  });

  const convertToArray = (input: string | undefined): string[] => {
    if (!input) return [];
    return input.split(",").map((item) => item.trim()).filter(Boolean);
  };

  const benefits = convertToArray(gemData?.shortBenefits);

  const navigationItems = [
    { id: "who-should-wear", label: "Who Should Wear?" },
    { id: "benefits", label: "Benefits" },
    { id: "prices", label: "Prices" },
    { id: "quality", label: "Quality" },
    { id: "specifications", label: "Specifications" },
    { id: "faqs", label: "FAQs" },
    { id: "curious-facts", label: "Curious Facts" },
  ];

  const renderContent = () => {
    if (!gemData) return <div className="text-slate-400">No content available</div>;

    switch (selectedSection) {
      case "who-should-wear":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.whoShouldWear || "" }} />;
      case "benefits":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.benefits || "" }} />;
      case "prices":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.prices || "" }} />;
      case "quality":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.quality || "" }} />;
      case "specifications":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.specifications || "" }} />;
      case "faqs":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.faqs || "" }} />;
      case "curious-facts":
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: gemData.curiousFacts || "" }} />;
      default:
        return <div className="text-slate-400">Content coming soon...</div>;
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-slate-400">Loading gemstone details...</p>
        </div>
      </div>
    );
  }

  if (!gemData) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-slate-300">Gemstone not found</p>
          <Button onClick={() => navigate("/home/gemblogs")} className="mt-6">
            Back to Gemstones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-10">
          <Button
            variant="ghost"
            onClick={() => navigate("/home/gemblogs")}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to All Gemstones
          </Button>

          <div className="flex gap-3">
            <Link to={`/home/gemblogs/edit/${id}`}>
              <Button className="bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Gemstone
              </Button>
            </Link>

            <ConfirmDelete 
              onConfirm={() => deleteMutation.mutate()} 
              title="Delete Gemstone"
              description="This action cannot be undone. This will permanently delete the gemstone and its associated data."
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Image + Basic Info */}
          <div className="lg:w-5/12">
            <div className="sticky top-6">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 aspect-square mb-8">
                <img
                  src={gemData.imageUrl || Image}
                  alt={gemData.name}
                  className="w-full h-full object-contain p-8 transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = Image;
                  }}
                />
              </div>

              <div>
                <h1 className="text-4xl font-serif font-medium text-white mb-4">
                  {gemData.name}
                </h1>
                <p className="text-slate-400 leading-relaxed text-lg">
                  {gemData.description}
                </p>
              </div>

              {/* Short Benefits */}
              {benefits.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Key Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 bg-slate-900/70 border border-white/5 rounded-2xl p-4">
                        <IoDiamondSharp className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Navigation + Content */}
          <div className="lg:w-7/12">
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSection(item.id)}
                  className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    selectedSection === item.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemDetails;