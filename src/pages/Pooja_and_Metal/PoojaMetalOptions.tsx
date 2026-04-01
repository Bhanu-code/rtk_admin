import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, Check, X, Flame, Gem } from 'lucide-react';
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

  const authHeader = { Authorization: `Bearer ${token}` };

  // Fetch Pooja/Energization options
  const fetchPoojaOptions = async () => {
    return await userRequest({
      url: '/pooja-energization',
      method: 'GET',
      headers: authHeader,
    });
  };

  // Fetch Metal/Dhatu options
  const fetchMetalOptions = async () => {
    return await userRequest({
      url: '/metal-dhatu',
      method: 'GET',
      headers: authHeader,
    });
  };

  const { refetch: refetchPooja } = useQuery('get-pooja-options', fetchPoojaOptions, {
    onSuccess: (response) => setPoojaOptions(response.data),
    onError: (error) => console.error('Error fetching Pooja/Energization options:', error),
  });

  const { refetch: refetchMetal } = useQuery('get-metal-options', fetchMetalOptions, {
    onSuccess: (response) => setMetalOptions(response.data),
    onError: (error) => console.error('Error fetching Metal/Dhatu options:', error),
  });

  // Add Pooja
  const handleAddPooja = async () => {
    try {
      await userRequest({
        url: '/pooja-energization',
        method: 'POST',
        headers: authHeader,
        data: { name: newPooja.name, price: parseFloat(newPooja.price) },
      });
      setNewPooja({ name: '', price: '' });
      refetchPooja();
    } catch (error) {
      console.error('Error adding Pooja/Energization option:', error);
    }
  };

  // Add Metal
  const handleAddMetal = async () => {
    try {
      await userRequest({
        url: '/metal-dhatu',
        method: 'POST',
        headers: authHeader,
        data: { name: newMetal.name, price: parseFloat(newMetal.price) },
      });
      setNewMetal({ name: '', price: '' });
      refetchMetal();
    } catch (error) {
      console.error('Error adding Metal/Dhatu option:', error);
    }
  };

  // Update Pooja
  const handleUpdatePooja = async () => {
    if (!editPooja) return;
    try {
      await userRequest({
        url: `/pooja-energization/${editPooja.id}`,
        method: 'PUT',
        headers: authHeader,
        data: {
          name: editPooja.name,
          price: typeof editPooja.price === 'string' ? parseFloat(editPooja.price) : editPooja.price,
        },
      });
      setEditPooja(null);
      refetchPooja();
    } catch (error) {
      console.error('Error updating Pooja/Energization option:', error);
    }
  };

  // Update Metal
  const handleUpdateMetal = async () => {
    if (!editMetal) return;
    try {
      await userRequest({
        url: `/metal-dhatu/${editMetal.id}`,
        method: 'PUT',
        headers: authHeader,
        data: {
          name: editMetal.name,
          price: typeof editMetal.price === 'string' ? parseFloat(editMetal.price) : editMetal.price,
        },
      });
      setEditMetal(null);
      refetchMetal();
    } catch (error) {
      console.error('Error updating Metal/Dhatu option:', error);
    }
  };

  // Delete Pooja
  const handleDeletePooja = async (id: number) => {
    try {
      await userRequest({
        url: `/pooja-energization/${id}`,
        method: 'DELETE',
        headers: authHeader,
      });
      refetchPooja();
    } catch (error) {
      console.error('Error deleting Pooja/Energization option:', error);
    }
  };

  // Delete Metal
  const handleDeleteMetal = async (id: number) => {
    try {
      await userRequest({
        url: `/metal-dhatu/${id}`,
        method: 'DELETE',
        headers: authHeader,
      });
      refetchMetal();
    } catch (error) {
      console.error('Error deleting Metal/Dhatu option:', error);
    }
  };

  const inputClass =
    "bg-[#1a1a2e] border-[#2a2a4a] text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20";

  const sectionCard = (
    title: string,
    icon: React.ReactNode,
    accent: string,
    addRow: React.ReactNode,
    tableBody: React.ReactNode
  ) => (
    <div
      className={`rounded-2xl border border-[#1e1e3a] bg-[#0f0f1e] shadow-xl overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-6 py-4 border-b border-[#1e1e3a] bg-[#12122a]`}>
        <span className={`p-2 rounded-lg ${accent}`}>{icon}</span>
        <h2 className="text-base font-semibold text-slate-100 tracking-wide">{title}</h2>
      </div>

      {/* Add row */}
      <div className="px-6 py-4 border-b border-[#1e1e3a]">{addRow}</div>

      {/* Table */}
      <div className="px-6 pb-6 pt-2">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1e1e3a] hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">Price</TableHead>
              <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableBody}</TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070f] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Options Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage Pooja/Energization and Metal/Dhatu options</p>
        </div>

        {/* Pooja/Energization */}
        {sectionCard(
          'Pooja / Energization Options',
          <Flame className="h-4 w-4 text-orange-400" />,
          'bg-orange-500/10',
          <div className="flex gap-3">
            <Input
              placeholder="Name"
              value={newPooja.name}
              onChange={(e) => setNewPooja({ ...newPooja, name: e.target.value })}
              className={inputClass}
            />
            <Input
              placeholder="Price"
              type="number"
              value={newPooja.price}
              onChange={(e) => setNewPooja({ ...newPooja, price: e.target.value })}
              className={`${inputClass} w-36`}
            />
            <Button
              onClick={handleAddPooja}
              disabled={!newPooja.name || !newPooja.price}
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 disabled:opacity-40"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>,
          <>
            {poojaOptions.map((option) => (
              <TableRow key={option.id} className="border-[#1e1e3a] hover:bg-white/[0.02] transition-colors">
                <TableCell className="text-slate-200">
                  {editPooja?.id === option.id ? (
                    <Input
                      value={editPooja.name}
                      onChange={(e) => setEditPooja({ ...editPooja, name: e.target.value })}
                      className={inputClass}
                    />
                  ) : (
                    option.name
                  )}
                </TableCell>
                <TableCell className="text-slate-300">
                  {editPooja?.id === option.id ? (
                    <Input
                      type="number"
                      value={editPooja.price}
                      onChange={(e) => setEditPooja({ ...editPooja, price: parseFloat(e.target.value) })}
                      className={`${inputClass} w-32`}
                    />
                  ) : (
                    <span className="text-orange-400 font-medium">₹{option.price}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {editPooja?.id === option.id ? (
                      <>
                        <Button size="sm" onClick={handleUpdatePooja} className="bg-green-600 hover:bg-green-700 text-white h-8 px-2">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditPooja(null)} className="text-slate-400 hover:text-slate-200 h-8 px-2">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setEditPooja(option)} className="text-slate-400 hover:text-violet-400 h-8 px-2">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDeletePooja(option.id)} className="text-slate-400 hover:text-red-400 h-8 px-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {poojaOptions.length === 0 && (
              <TableRow className="border-0">
                <TableCell colSpan={3} className="text-center text-slate-600 py-8 text-sm">No options added yet</TableCell>
              </TableRow>
            )}
          </>
        )}

        {/* Metal/Dhatu */}
        {sectionCard(
          'Metal / Dhatu Options',
          <Gem className="h-4 w-4 text-violet-400" />,
          'bg-violet-500/10',
          <div className="flex gap-3">
            <Input
              placeholder="Name"
              value={newMetal.name}
              onChange={(e) => setNewMetal({ ...newMetal, name: e.target.value })}
              className={inputClass}
            />
            <Input
              placeholder="Price"
              type="number"
              value={newMetal.price}
              onChange={(e) => setNewMetal({ ...newMetal, price: e.target.value })}
              className={`${inputClass} w-36`}
            />
            <Button
              onClick={handleAddMetal}
              disabled={!newMetal.name || !newMetal.price}
              className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 disabled:opacity-40"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>,
          <>
            {metalOptions.map((option) => (
              <TableRow key={option.id} className="border-[#1e1e3a] hover:bg-white/[0.02] transition-colors">
                <TableCell className="text-slate-200">
                  {editMetal?.id === option.id ? (
                    <Input
                      value={editMetal.name}
                      onChange={(e) => setEditMetal({ ...editMetal, name: e.target.value })}
                      className={inputClass}
                    />
                  ) : (
                    option.name
                  )}
                </TableCell>
                <TableCell className="text-slate-300">
                  {editMetal?.id === option.id ? (
                    <Input
                      type="number"
                      value={editMetal.price}
                      onChange={(e) => setEditMetal({ ...editMetal, price: parseFloat(e.target.value) })}
                      className={`${inputClass} w-32`}
                    />
                  ) : (
                    <span className="text-violet-400 font-medium">₹{option.price}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {editMetal?.id === option.id ? (
                      <>
                        <Button size="sm" onClick={handleUpdateMetal} className="bg-green-600 hover:bg-green-700 text-white h-8 px-2">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditMetal(null)} className="text-slate-400 hover:text-slate-200 h-8 px-2">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setEditMetal(option)} className="text-slate-400 hover:text-violet-400 h-8 px-2">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteMetal(option.id)} className="text-slate-400 hover:text-red-400 h-8 px-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {metalOptions.length === 0 && (
              <TableRow className="border-0">
                <TableCell colSpan={3} className="text-center text-slate-600 py-8 text-sm">No options added yet</TableCell>
              </TableRow>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PoojaMetalOptions;