import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Clock, MapPin, Phone } from 'lucide-react';

const Astrologers = () => {
  const [astrologers, setAstrologers] = useState([
    {
      id: "1",
      full_name: "Dr. Sharma",
      experience: "15 years",
      address: "123 Mystic Lane, New Delhi",
      contact_no: "+91 98765 43210",
      availibity: {
        monday: ["10:00-13:00", "15:00-18:00"],
        tuesday: ["09:00-14:00"],
        wednesday: ["11:00-17:00"]
      }
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);

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
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Astrologer
          </Button>
        </CardHeader>
        <CardContent>
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
                  <div className="text-2xl font-bold">{astrologers.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {astrologers.map((astrologer) => (
                    <TableRow key={astrologer.id}>
                      <TableCell className="font-medium">{astrologer.full_name}</TableCell>
                      <TableCell>{astrologer.experience}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          {astrologer.contact_no}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          {astrologer.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAstrologer(astrologer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>

      {/* Add/Edit Astrologer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAstrologer ? "Edit Astrologer" : "Add New Astrologer"}
            </DialogTitle>
            <DialogDescription>
              Enter the astrologer's details and availability schedule
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. John Doe" />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Experience</FormLabel>
                <FormControl>
                  <Input placeholder="15 years" />
                </FormControl>
              </FormItem>
            </div>

            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="+91 98765 43210" />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter complete address" />
              </FormControl>
            </FormItem>

            <div>
              <FormLabel>Availability Schedule</FormLabel>
              <FormDescription className="mt-2">
                Set the weekly availability schedule for consultations
              </FormDescription>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <Card key={day} className="p-4">
                    <h4 className="font-medium mb-2">{day}</h4>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="10:00-13:00" className="w-32" />
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                {selectedAstrologer ? "Update Astrologer" : "Add Astrologer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Astrologers;