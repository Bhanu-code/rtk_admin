import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Save, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { userRequest } from '@/utils/requestMethods';
import { toast } from "sonner";

interface Offer {
  id: string;
  content: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const OfferAdminPanel = () => {
  const [newOffer, setNewOffer] = useState({ content: '', isActive: true });
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useSelector((state: any) => state.user?.accessToken);

  // Fetch all offers
  const { data: offers = [], isLoading, error, refetch } = useQuery<Offer[], Error>(
    'get-offers',
    async () => {
      const response = await userRequest({
        url: '/offers',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(response.data) ? response.data : [];
    },
    {
      refetchOnWindowFocus: false,
      onError: () => { toast.error("Failed to load offers"); },
    }
  );

  // Add new offer
  const handleAddOffer = async () => {
    if (!newOffer.content.trim()) {
      toast.error("Please enter offer content");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest({
        url: '/offers',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        data: newOffer,
      });

      setNewOffer({ content: '', isActive: true });
      refetch();
      toast.success("Offer created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing
  const handleEditOffer = (offer: Offer) => {
    setEditOffer({ ...offer });
  };

  // Update offer
  const handleUpdateOffer = async () => {
    if (!editOffer) return;

    try {
      setIsSubmitting(true);
      await userRequest({
        url: `/offers/${editOffer.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        data: editOffer,
      });

      setEditOffer(null);
      refetch();
      toast.success("Offer updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete offer
  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    try {
      await userRequest({
        url: `/offers/${id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      refetch();
      toast.success("Offer deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete offer");
    }
  };

  // Toggle active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const offer = offers.find(o => o.id === id);
      if (!offer) return;

      await userRequest({
        url: `/offers/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        data: { ...offer, isActive: !currentStatus },
      });

      refetch();
      toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#020617] min-h-screen">
      <Card className="border-white/10 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Navbar Offer Management</CardTitle>
          <CardDescription className="text-slate-400">
            Manage promotional offers shown in the navigation bar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Error Message */}
          {error instanceof Error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
              <AlertCircle className="h-5 w-5" />
              Failed to load offers. Please refresh the page.
            </div>
          )}

          {/* Add New Offer */}
          <Card className="border-dashed border-2 border-white/20 bg-slate-950/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add New Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter promotional offer text (e.g., 'Flat 20% OFF on all Gemstones this weekend!')"
                  value={newOffer.content}
                  onChange={(e) => setNewOffer({ ...newOffer, content: e.target.value })}
                  className="min-h-[80px] bg-slate-900 border-white/10 text-white placeholder:text-slate-500 resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={newOffer.isActive}
                      onCheckedChange={(checked) => setNewOffer({ ...newOffer, isActive: checked })}
                    />
                    <span className="text-sm text-slate-300">Make this offer active immediately</span>
                  </div>

                  <Button
                    onClick={handleAddOffer}
                    disabled={!newOffer.content.trim() || isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Adding..." : "Add Offer"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offers Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Offers ({offers.length})</h3>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300">Offer Content</TableHead>
                    <TableHead className="w-32 text-slate-300">Status</TableHead>
                    <TableHead className="w-40 text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-slate-400">
                        Loading offers...
                      </TableCell>
                    </TableRow>
                  ) : offers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-slate-500">
                        No offers yet. Create your first offer above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => (
                      <TableRow key={offer.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white">
                          {editOffer?.id === offer.id ? (
                            <Textarea
                              value={editOffer.content}
                              onChange={(e) => setEditOffer({ ...editOffer, content: e.target.value })}
                              className="min-h-[60px] bg-slate-800 border-white/10"
                            />
                          ) : (
                            <span className="line-clamp-2">{offer.content}</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {editOffer?.id === offer.id ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={editOffer.isActive}
                                onCheckedChange={(checked) => setEditOffer({ ...editOffer, isActive: checked })}
                              />
                              <span className="text-sm text-slate-400">
                                {editOffer.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={offer.isActive}
                                onCheckedChange={() => handleToggleStatus(offer.id, offer.isActive)}
                              />
                              <span className={`text-sm font-medium ${offer.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {offer.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {editOffer?.id === offer.id ? (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={handleUpdateOffer}
                                  disabled={isSubmitting}
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditOffer(null)}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditOffer(offer)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferAdminPanel;