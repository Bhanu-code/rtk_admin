import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Products = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  const queryClient = useQueryClient();

  // Fetch data query
  const { data: gemstones, isLoading, error } = useQuery({
    queryKey: ['gemstones'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/gemstones/get-all-gemblog');
      console.log('Fetched gemstones data:', response.data);
      return response.data;
    }
  });

  // Update mutation with correct ID field
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      // Remove any undefined or null values from updatedData
      const cleanedData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value != null)
      );

      console.log('Sending update request for ID:', selectedItem.id);
      console.log('Update payload:', cleanedData);

      try {
        const response = await axios.put(
          `http://localhost:5000/gemstones/update-gemblog/${selectedItem.id}`,
          cleanedData
        );
        return response.data;
      } catch (error) {
        console.error('Update request failed:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      queryClient.invalidateQueries(['gemstones']);
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Gemstone updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating gemstone:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update gemstone';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });


  // Delete mutation with correct ID field
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log('Deleting item with ID:', id);
      const response = await axios.delete(
        `http://localhost:5000/gemstones/delete-gemblog/${id}`
      );
      console.log('Delete response:', response.data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log(`Successfully deleted item with ID: ${variables}`);
      queryClient.invalidateQueries(['gemstones']);
    },
    onError: (error, variables) => {
      console.error(`Error deleting item with ID: ${variables}`);
      console.error('Error details:', error);
    }
  });

  const handleEdit = (item) => {
    console.log('Editing item:', item);
    // Create a clean copy of the item data
    const cleanItem = {
      name: item.name,
      description: item.description,
      benefits: item.benefits,
      color: item.color,
      alternateNames: Array.isArray(item.alternateNames) ? [...item.alternateNames] : [],
      // Add other fields as needed
    };
    setSelectedItem(item);
    setEditedData(cleanItem);
    setIsEditModalOpen(true);
  };


  const handleSave = async () => {
    console.log('Saving edited data:', editedData);
    updateMutation.mutate(editedData);
  };

  const handleDelete = async (id) => {
    console.log('Delete button clicked for item with ID:', id);
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const renderEditForm = () => {
    if (!editedData) return null;

    // Updated to exclude non-editable fields
    const editableFields = Object.entries(editedData).filter(
      ([key]) => !['id', '__v', 'createdAt', 'updatedAt'].includes(key)
    );

    return editableFields.map(([key, value]) => {
      // Special handling for array and object values
      if (Array.isArray(value)) {
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium mb-1">{key}</label>
            <Input
              type="text"
              value={value.join(', ')}
              onChange={(e) => {
                const newValue = e.target.value.split(',').map(item => item.trim());
                setEditedData({ ...editedData, [key]: newValue });
              }}
              className="w-full"
            />
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        // For now, we'll show object fields as read-only
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium mb-1">{key}</label>
            <Input
              type="text"
              value={JSON.stringify(value)}
              disabled
              className="w-full bg-gray-100"
            />
          </div>
        );
      }
      
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium mb-1">{key}</label>
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => setEditedData({ ...editedData, [key]: e.target.value })}
            className="w-full"
          />
        </div>
      );
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gemstone Blogs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gemstones?.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
            <p className="text-gray-600 mb-2">{item.description?.slice(0, 100)}...</p>
            
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={() => handleEdit(item)}
                variant="outline"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(item.id)}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Gemstone Blog</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {renderEditForm()}
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={updateMutation.isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;