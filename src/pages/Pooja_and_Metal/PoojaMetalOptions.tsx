import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Edit } from 'lucide-react';
import { userRequest } from '@/utils/requestMethods';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

interface PoojaOption {
  id: number;
  name: string;
  price: number;
}

interface MetalOption {
  id: number;
  name: string;
  price: number;
}

const PoojaMetalOptions = () => {
  const [poojaOptions, setPoojaOptions] = useState<PoojaOption[]>([]);
  const [metalOptions, setMetalOptions] = useState<MetalOption[]>([]);
  const [newPooja, setNewPooja] = useState({ name: '', price: '' });
  const [newMetal, setNewMetal] = useState({ name: '', price: '' });
  const [editPooja, setEditPooja] = useState<PoojaOption | null>(null);
  const [editMetal, setEditMetal] = useState<MetalOption | null>(null);

  const token = useSelector((state: any) => state.user.accessToken);

  // Fetch Pooja/Energization options
  const fetchPoojaOptions = async () => {
    return await userRequest({
      url: '/pooja-metal/pooja-energization',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fetch Metal/Dhatu options
  const fetchMetalOptions = async () => {
    return await userRequest({
      url: '/pooja-metal/metal-dhatu',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Use react-query to fetch data
  const { refetch: refetchPooja } = useQuery('get-pooja-options', fetchPoojaOptions, {
    onSuccess: (response) => {
      setPoojaOptions(response.data);
    },
    onError: (error) => {
      console.error('Error fetching Pooja/Energization options:', error);
    },
  });

  const { refetch: refetchMetal } = useQuery('get-metal-options', fetchMetalOptions, {
    onSuccess: (response) => {
      setMetalOptions(response.data);
    },
    onError: (error) => {
      console.error('Error fetching Metal/Dhatu options:', error);
    },
  });

  // Add Pooja/Energization option
  const handleAddPooja = async () => {
    try {
      // Convert price to a number before sending to API
      const poojaData = {
        name: newPooja.name,
        price: parseFloat(newPooja.price)
      };
      
      await userRequest({
        url: '/pooja-metal/pooja-energization',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: poojaData,
      });
      setNewPooja({ name: '', price: '' });
      refetchPooja();
    } catch (error) {
      console.error('Error adding Pooja/Energization option:', error);
    }
  };

  // Add Metal/Dhatu option
  const handleAddMetal = async () => {
    try {
      // Convert price to a number before sending to API
      const metalData = {
        name: newMetal.name,
        price: parseFloat(newMetal.price)
      };
      
      await userRequest({
        url: '/pooja-metal/metal-dhatu',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: metalData,
      });
      setNewMetal({ name: '', price: '' });
      refetchMetal();
    } catch (error) {
      console.error('Error adding Metal/Dhatu option:', error);
    }
  };

  // Edit Pooja/Energization option
  const handleEditPooja = async (id: number) => {
    const option = poojaOptions.find((opt) => opt.id === id);
    setEditPooja(option || null);
  };

  // Edit Metal/Dhatu option
  const handleEditMetal = async (id: number) => {
    const option = metalOptions.find((opt) => opt.id === id);
    setEditMetal(option || null);
  };

  // Update Pooja/Energization option
  const handleUpdatePooja = async () => {
    if (!editPooja) return;
    try {
      // Make sure the price is a number
      const poojaData = {
        name: editPooja.name,
        price: typeof editPooja.price === 'string' ? parseFloat(editPooja.price) : editPooja.price
      };
      
      await userRequest({
        url: `/pooja-metal/pooja-energization/${editPooja.id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: poojaData,
      });
      setEditPooja(null);
      refetchPooja();
    } catch (error) {
      console.error('Error updating Pooja/Energization option:', error);
    }
  };

  // Update Metal/Dhatu option
  const handleUpdateMetal = async () => {
    if (!editMetal) return;
    try {
      // Make sure the price is a number
      const metalData = {
        name: editMetal.name,
        price: typeof editMetal.price === 'string' ? parseFloat(editMetal.price) : editMetal.price
      };
      
      await userRequest({
        url: `/pooja-metal/metal-dhatu/${editMetal.id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: metalData,
      });
      setEditMetal(null);
      refetchMetal();
    } catch (error) {
      console.error('Error updating Metal/Dhatu option:', error);
    }
  };

  // Delete Pooja/Energization option
  const handleDeletePooja = async (id: number) => {
    try {
      await userRequest({
        url: `/pooja-metal/pooja-energization/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      refetchPooja();
    } catch (error) {
      console.error('Error deleting Pooja/Energization option:', error);
    }
  };

  // Delete Metal/Dhatu option
  const handleDeleteMetal = async (id: number) => {
    try {
      await userRequest({
        url: `/pooja-metal/metal-dhatu/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      refetchMetal();
    } catch (error) {
      console.error('Error deleting Metal/Dhatu option:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Pooja/Energization Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pooja/Energization Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Name"
                value={newPooja.name}
                onChange={(e) => setNewPooja({ ...newPooja, name: e.target.value })}
              />
              <Input
                placeholder="Price"
                type="number"
                value={newPooja.price}
                onChange={(e) => setNewPooja({ ...newPooja, price: e.target.value })}
              />
              <Button 
                onClick={handleAddPooja}
                disabled={!newPooja.name || !newPooja.price}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poojaOptions.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell>
                      {editPooja?.id === option.id ? (
                        <Input
                          value={editPooja.name}
                          onChange={(e) =>
                            setEditPooja({ ...editPooja, name: e.target.value })
                          }
                        />
                      ) : (
                        option.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editPooja?.id === option.id ? (
                        <Input
                          type="number"
                          value={editPooja.price}
                          onChange={(e) =>
                            setEditPooja({ ...editPooja, price: parseFloat(e.target.value) })
                          }
                        />
                      ) : (
                        `Rs. ${option.price}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editPooja?.id === option.id ? (
                        <Button onClick={handleUpdatePooja}>Save</Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleEditPooja(option.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => handleDeletePooja(option.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Metal/Dhatu Section */}
      <Card>
        <CardHeader>
          <CardTitle>Metal/Dhatu Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Name"
                value={newMetal.name}
                onChange={(e) => setNewMetal({ ...newMetal, name: e.target.value })}
              />
              <Input
                placeholder="Price"
                type="number"
                value={newMetal.price}
                onChange={(e) => setNewMetal({ ...newMetal, price: e.target.value })}
              />
              <Button 
                onClick={handleAddMetal}
                disabled={!newMetal.name || !newMetal.price}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metalOptions.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell>
                      {editMetal?.id === option.id ? (
                        <Input
                          value={editMetal.name}
                          onChange={(e) =>
                            setEditMetal({ ...editMetal, name: e.target.value })
                          }
                        />
                      ) : (
                        option.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editMetal?.id === option.id ? (
                        <Input
                          type="number"
                          value={editMetal.price}
                          onChange={(e) =>
                            setEditMetal({ ...editMetal, price: parseFloat(e.target.value) })
                          }
                        />
                      ) : (
                        `Rs. ${option.price}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editMetal?.id === option.id ? (
                        <Button onClick={handleUpdateMetal}>Save</Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleEditMetal(option.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteMetal(option.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoojaMetalOptions;