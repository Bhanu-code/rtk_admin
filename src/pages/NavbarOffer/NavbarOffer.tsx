import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Edit, Save } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { userRequest } from '@/utils/requestMethods';

interface Offer {
  id: string;
  content: string;
  isActive: boolean;
}

const OfferAdminPanel = () => {
  // State management
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOffer, setNewOffer] = useState({ content: '', isActive: true });
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from Redux store
  const token = useSelector((state: any) => state.user?.accessToken);

  // Fetch all offers
  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userRequest({
        url: '/offer',  // Make sure this matches your API endpoint
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (err) {
      console.error('Error in fetchOffers:', err);
      setError('Failed to fetch offers');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Use react-query to fetch data
  const { refetch: refetchOffers } = useQuery('get-offers', fetchOffers, {
    onSuccess: (response) => {
      // Check if response.data exists and is an array before setting state
      if (response && response.data) {
        // If the API returns a single object, convert it to an array
        const offersData = Array.isArray(response.data) ? response.data : [response.data];
        setOffers(offersData);
      } else {
        // Initialize with empty array if no data
        setOffers([]);
      }
    },
    onError: (error) => {
      console.error('Error fetching offers:', error);
      setError('Failed to load offers. Please try again later.');
      // Initialize with empty array on error
      setOffers([]);
    },
    // Don't automatically refetch on window focus
    refetchOnWindowFocus: false,
  });

  // Add new offer
  const handleAddOffer = async () => {
    if (!newOffer.content.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await userRequest({
        url: '/offer',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: newOffer,
      });
      
      setNewOffer({ content: '', isActive: true });
      refetchOffers();
    } catch (error) {
      console.error('Error adding offer:', error);
      setError('Failed to add offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit offer
  const handleEditOffer = (id: string) => { // Changed from number to string
    const offer = offers.find((offer) => offer.id === id);
    setEditOffer(offer || null);
  };
  

  // Update offer
  const handleUpdateOffer = async () => {
    if (!editOffer) return;
    
    try {
      setIsSubmitting(true);
      await userRequest({
        url: `/offer/${editOffer.id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: editOffer,
      });
      
      setEditOffer(null);
      refetchOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      setError('Failed to update offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete offer
  const handleDeleteOffer = async (id: string) => { // Changed from number to string
    try {
      await userRequest({
        url: `/offer/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      refetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setError('Failed to delete offer. Please try again.');
    }
  };

  // Toggle offer active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => { // Changed from number to string
    try {
      const offer = offers.find(offer => offer.id === id);
      if (!offer) return;
      
      await userRequest({
        url: `/offer/${id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { ...offer, isActive: !currentStatus },
      });
      
      refetchOffers();
    } catch (error) {
      console.error('Error toggling offer status:', error);
      setError('Failed to update offer status. Please try again.');
    }
  };
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Navbar Offer Management</CardTitle>
          <CardDescription>
            Create and manage promotional offers that appear in the navigation bar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Add New Offer Form */}
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="text-lg">Add New Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <Textarea
                      placeholder="Enter offer content (e.g., '20% OFF on all items this weekend!')"
                      value={newOffer.content}
                      onChange={(e) => setNewOffer({ ...newOffer, content: e.target.value })}
                      className="min-h-20 resize-none"
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newOffer.isActive}
                        onCheckedChange={(checked) => setNewOffer({ ...newOffer, isActive: checked })}
                      />
                      <span>Active</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddOffer} 
                    disabled={!newOffer.content || isSubmitting}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Offer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Offers List */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer Content</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        Loading offers...
                      </TableCell>
                    </TableRow>
                  ) : offers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No offers found. Create your first offer above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">
                          {editOffer?.id === offer.id ? (
                            <Textarea
                              value={editOffer.content}
                              onChange={(e) => setEditOffer({ ...editOffer, content: e.target.value })}
                              className="min-h-20"
                            />
                          ) : (
                            offer.content
                          )}
                        </TableCell>
                        <TableCell>
                          {editOffer?.id === offer.id ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={editOffer.isActive}
                                onCheckedChange={(checked) => setEditOffer({ ...editOffer, isActive: checked })}
                              />
                              <span>{editOffer.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={offer.isActive}
                                onCheckedChange={() => handleToggleStatus(offer.id, offer.isActive)}
                              />
                              <span>{offer.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {editOffer?.id === offer.id ? (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={handleUpdateOffer}
                                disabled={isSubmitting}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOffer(offer.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOffer(offer.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
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