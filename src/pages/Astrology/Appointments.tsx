import { useState } from 'react';
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from '@/components/ui/calendar';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, Clock, UserCircle, Search } from 'lucide-react';

const Appointments = () => {
  // Sample data - in production, this would come from your API
  const [appointments, _] = useState([
    {
      id: "1",
      userId: "user1",
      user: { firstname: "John", lastname: "Doe", email: "john@example.com" },
      astrolgerId: "astro1",
      astrolger: { full_name: "Dr. Sharma", experience: "15 years" },
      date: new Date("2025-01-22"),
      time: "10:00",
      created_at: new Date("2025-01-21")
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Function to format date for display
  const formatDate = (date:any) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Appointments Management</CardTitle>
            <CardDescription>
              Schedule and manage astrology consultation appointments
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">4 completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Next 7 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Astrologers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">3 available today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45m</div>
                  <p className="text-xs text-muted-foreground">Per consultation</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search appointments..." className="pl-8" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Views */}
            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Astrologer</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <UserCircle className="w-8 h-8 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                  {appointment.user.firstname} {appointment.user.lastname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{appointment.astrolger.full_name}</div>
                              <div className="text-sm text-gray-500">
                                {appointment.astrolger.experience}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                              {formatDate(appointment.date)}
                              <Clock className="w-4 h-4 ml-4 mr-2 text-gray-500" />
                              {appointment.time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              Upcoming
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card className="p-6">
                  <div className="flex h-96 items-center justify-center text-gray-500">
                    Calendar View Implementation
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new consultation appointment by selecting an astrologer and time slot
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <FormItem>
              <FormLabel>Select Astrologer</FormLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an astrologer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="astro1">Dr. Sharma (15 years exp.)</SelectItem>
                  <SelectItem value="astro2">Mr. Verma (10 years exp.)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Select Client</FormLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">John Doe (john@example.com)</SelectItem>
                  <SelectItem value="client2">Jane Smith (jane@example.com)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Calendar 
                  mode="single"
                  className="rounded-md border"
                />
              </FormItem>

              <FormItem>
                <FormLabel>Available Time Slots</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {["10:00", "11:00", "14:00", "15:00"].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className="justify-start"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {time}
                    </Button>
                  ))}
                </div>
              </FormItem>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Schedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;