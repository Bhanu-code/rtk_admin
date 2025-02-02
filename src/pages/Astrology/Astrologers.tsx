import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, MapPin, Phone, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

// TypeScript interface for Astrologer
interface Astrologer {
  id?: string;
  full_name: string;
  experience: string;
  address: string;
  contact_no: string;
  availibity: {
    [key: string]: string[] | undefined;  // Allow undefined for safer typing
  };
}

// Initial state for form
const INITIAL_ASTROLOGER_STATE: Astrologer = {
  full_name: '',
  experience: '',
  address: '',
  contact_no: '',
  availibity: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  }
};

const AvailabilityDisplay = ({ availability }: { availability: any }) => {
  const formatAvailability = () => {
    // Parse stringified availability
    let parsedAvailability;
    try {
      parsedAvailability = typeof availability === 'string' 
        ? JSON.parse(availability) 
        : availability;
    } catch (error) {
      console.error('Error parsing availability:', error);
      return <div className="text-sm text-gray-500">Invalid availability data</div>;
    }

    // Defensive programming to handle different data scenarios
    if (!parsedAvailability || typeof parsedAvailability !== 'object') {
      return <div className="text-sm text-gray-500">No availability data</div>;
    }

    const availabilityEntries = Object.entries(parsedAvailability);

    // Check if there are no entries or entries are invalid
    if (availabilityEntries.length === 0) {
      return <div className="text-sm text-gray-500">No availability scheduled</div>;
    }

    return availabilityEntries
      .filter(([_, slots]) => 
        // Ensure slots is an array and has elements
        Array.isArray(slots) && slots.length > 0
      )
      .map(([day, slots]) => (
        <div key={day} className="flex items-center space-x-2 mb-1">
          <span className="font-medium w-20">{day}:</span>
          <div className="flex space-x-1">
            {(slots as string[]).map((slot, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {slot}
              </Badge>
            ))}
          </div>
        </div>
      ));
  };

  return (
    <div className="text-sm">
      {formatAvailability()}
    </div>
  );
};

const Astrologers = () => {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [formData, setFormData] = useState<Astrologer>(INITIAL_ASTROLOGER_STATE);
  const [astrologerToDelete, setAstrologerToDelete] = useState<string | null>(null);

  // Redux selector for token
  const token = useSelector((state: any) => state.user.accessToken);

  // Query client for cache management
  const queryClient = useQueryClient();

  // Fetch Astrologers Query
  const { data: astrologers = [], isLoading, refetch } = useQuery(
    'astrologers',
    async () => {
      const response = await axios.get('/astrologers/get-all-astrolgers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.data;
    }
  );

  console.log("ASTROLOGERS : ", astrologers)

  // Create Astrologer Mutation
  const createAstrologerMutation = useMutation({
    mutationFn: async (data: Astrologer) => {
      const response = await axios.post('/astrologers/create-astrologer', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    },
    onSuccess: () => {
      refetch(); // Refresh data
      setIsDialogOpen(false);
      setFormData(INITIAL_ASTROLOGER_STATE);
      toast.success('Astrologer added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add astrologer');
      console.error('Error adding astrologer:', error);
    }
  });


  // Update Astrologer Mutation
  const updateAstrologerMutation = useMutation({
    mutationFn: async (data: Astrologer) => {
      if (!token || !data.id) throw new Error('Authentication token or ID is missing');

      const response = await axios.put(`/astrologers/update-astrolger/${data.id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    },
    onSuccess: () => {
      refetch(); // Refresh data
      setIsDialogOpen(false);
      setFormData(INITIAL_ASTROLOGER_STATE);
      setSelectedAstrologer(null);
      toast.success('Astrologer updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update astrologer');
      console.error('Error updating astrologer:', error);
    }
  });

  // Delete Astrologer Mutation
  const deleteAstrologerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Authentication token is missing');

      await axios.delete(`/astrologers/delete-astrologer/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return id;
    },
    onSuccess: () => {
      refetch(); // Refresh data
      setIsDeleteDialogOpen(false);
      setAstrologerToDelete(null);
      toast.success('Astrologer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete astrologer');
      console.error('Error deleting astrologer:', error);
    }
  });

  const handleConfirmDelete = () => {
    if (astrologerToDelete) {
      deleteAstrologerMutation.mutate(astrologerToDelete);
    }
  };


  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open edit dialog
  const handleOpenEditDialog = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setFormData(astrologer);
    setIsDialogOpen(true);
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setSelectedAstrologer(null);
    setFormData(INITIAL_ASTROLOGER_STATE);
    setIsDialogOpen(true);
  };

  // Add availability slot
  const addAvailabilitySlot = (day: string) => {
    console.log('Adding slot for day:', day);
    console.log('Current availability before add:', formData.availibity);
  
    setFormData(prev => {
      const updatedAvailability = {
        ...prev.availibity,
        [day]: [...(prev.availibity[day] || []), '']
      };
  
      console.log('Updated availability:', updatedAvailability);
  
      return {
        ...prev,
        availibity: updatedAvailability
      };
    });
  };

  // Handle form submission
 // Modify the handleSubmit function
 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Ensure availability is filtered and valid
  const filteredAvailability = Object.fromEntries(
    Object.entries(formData.availibity).map(([day, slots]) => [
      day, 
      slots.filter(slot => slot.trim() !== '')
    ])
  );

  const submissionData = {
    ...formData,
    availibity: filteredAvailability
  };

  if (selectedAstrologer) {
    updateAstrologerMutation.mutate({
      ...submissionData,
      id: selectedAstrologer.id
    });
  } else {
    createAstrologerMutation.mutate(submissionData);
  }
};

  return (
    <div className="p-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Astrologers Management</CardTitle>
            <CardDescription>
              Manage your astrologer profiles, availability, and appointments
            </CardDescription>
          </div>
          <Button
            onClick={handleOpenAddDialog}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Astrologer
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid gap-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Astrologers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{astrologers?.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Astrologers Table */}
              <Card>
              <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {astrologers?.map((astrologer: any) => (
            <TableRow key={astrologer.id}>
            <TableCell>{astrologer.full_name}</TableCell>
            <TableCell>{astrologer.experience}</TableCell>
            <TableCell>{astrologer.contact_no}</TableCell>
            <TableCell>{astrologer.address}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <AvailabilityDisplay availability={astrologer?.availibity || {}} />
              </div>
            </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditDialog(astrologer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setAstrologerToDelete(astrologer.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit Astrologer */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAstrologer ? "Edit Astrologer" : "Add New Astrologer"}
            </DialogTitle>
            <DialogDescription>
              Enter the astrologer's details and availability schedule
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <Input
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="15 years"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <Input
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability Schedule</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                    <Card key={day} className="p-4">
                      <h4 className="font-medium mb-2">{day}</h4>
                      {(formData.availibity[day] || []).map((slot, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <Input
                            value={slot}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setFormData(prev => {
                                const newAvailability = [...(prev.availibity[day] || [])];
                                newAvailability[index] = newValue;
                                
                                return {
                                  ...prev,
                                  availibity: {
                                    ...prev.availibity,
                                    [day]: newAvailability
                                  }
                                };
                              });
                            }}
                            placeholder="10:00-13:00"
                            className="w-32"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAvailabilitySlot(day)}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Slot
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {selectedAstrologer ? "Update Astrologer" : "Add Astrologer"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the astrologer's profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Astrologers;