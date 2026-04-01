import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import { Plus, Eye } from "lucide-react";
import { userRequest } from "@/utils/requestMethods";
import { Card, CardContent } from "@/components/ui/card";

// Define your Gemstone type (Recommended)
interface Gemstone {
  id: string | number;
  name: string;
  imageUrl?: string;
  shortBenefits?: string;
  description?: string;
  featured?: boolean;
  // add other fields as needed
}

const Gemblogs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const getAllGems = async (): Promise<{ data: Gemstone[] }> => {
    const response = await userRequest({
      url: "/gemstones",
      method: "GET",
    });
    return response;
  };

  const { 
    data: response, 
    isLoading, 
    error 
  } = useQuery<{ data: Gemstone[] }, Error>(
    "get-all-gems",
    getAllGems,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const gemblogs: Gemstone[] = response?.data || [];

  const filteredGemblogs = gemblogs.filter((item) =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#020617] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white">Gemstone Blogs</h1>
            <p className="text-slate-400 mt-1">
              Manage your gemstone knowledge base
            </p>
          </div>

          <Link to="/home/gemblogs/add">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 px-5 py-2.5">
              <Plus className="h-5 w-5" />
              Add New Gemstone
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search gemstones by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-5 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <ClipLoader size={40} color="#6366f1" />
              <p className="text-slate-400">Loading gemstones...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
            Failed to load gemstones. Please try again later.
          </div>
        )}

        {/* Gemstones Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredGemblogs.length > 0 ? (
              filteredGemblogs.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/home/gemblogs/${item.id}`}
                  className="group"
                >
                  <Card className="bg-slate-900 border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 h-full">
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-600 h-full">
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                              💎
                            </div>
                            <p className="text-xs text-slate-500">No image</p>
                          </div>
                        )}

                        {item.featured && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-white line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
                          {item.name}
                        </h3>
                        
                        <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                          {item.shortBenefits || item.description?.slice(0, 120) || "No description available"}...
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Published
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-slate-400 hover:text-white group-hover:bg-white/5"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl text-slate-300 mb-2">No gemstones found</h3>
                <p className="text-slate-500">
                  {searchTerm 
                    ? `No results for "${searchTerm}"` 
                    : "Start by adding your first gemstone"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gemblogs;