import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Calendar } from "../../components/ui/calendar"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Textarea } from "../../components/ui/textarea" 
import { Toaster } from "../../components/ui/sonner"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"
import { cn } from "../../lib/utils"
import { 
  User, 
  UserCircle, 
  Phone, 
  Mail, 
  Building,
  CreditCard,
  MessageSquare,
  Smartphone
} from "lucide-react"

// Form validation schema
const formSchema = z.object({
  userName: z.string().min(2, "Username must be at least 2 characters"),
  userId: z.string().min(1, "User ID is required"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date().optional().nullable(),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  providerName: z.string().min(2, "Provider name is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  providerMobile: z.string().min(10, "Provider mobile must be at least 10 digits"),
  providerEmail: z.string().email("Invalid provider email address"),
  deviceAllocation: z.date().optional().nullable(),
  lastUsed: z.date().optional().nullable(),
  remarks: z.string().optional()
})

const AddUser = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      userId: "",
      gender: "male",
      dateOfBirth: null,
      mobile: "",
      email: "",
      providerName: "John Doe Provider",
      providerId: "PRV123456",
      providerMobile: "+1 234-567-8900",
      providerEmail: "provider@example.com",
      deviceAllocation: null,
      lastUsed: null,
      remarks: ""
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted:', values);
    Toaster({
      title: "User Registration Successful",
      description: "New user has been added successfully.",
    })
    navigate('/provider');
  }

  return (
    <div className="container min-h-screen px-4 py-10 mx-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-4xl mx-auto transition-all duration-300 border border-gray-200 shadow-xl hover:shadow-2xl dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader className="space-y-1 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-3xl font-semibold text-center text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text dark:from-gray-100 dark:to-gray-400">
            Add New User
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Provider Details Section */}
              <div className="p-6 space-y-6 transition-colors duration-200 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">Provider Details</h3>
                
                {/* Provider Name and ID Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="providerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              {...field} 
                              readOnly 
                              className="bg-muted pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              {...field} 
                              readOnly 
                              className="bg-muted pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Provider Mobile and Email Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="providerMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Mobile</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              {...field} 
                              readOnly 
                              className="bg-muted pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="providerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder={field.value}
                              {...field} 
                              readOnly 
                              className="bg-muted pl-9"
                              type="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* User Details Section */}
              <div className="p-6 space-y-6 transition-colors duration-200 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">User Details</h3>
                
                {/* Username and User ID Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter username" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter user ID" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Gender and DOB Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Details Section */}
              <div className="p-6 space-y-6 transition-colors duration-200 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">Contact Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter mobile number" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter email address" 
                              type="email" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Device Details Section */}
              <div className="p-6 space-y-6 transition-colors duration-200 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">Device Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deviceAllocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Device Allocation Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastUsed"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Last Used Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                          <Textarea 
                            placeholder="Add any additional notes" 
                            {...field} 
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Updated Button Section with Larger Buttons */}
              <div className="flex justify-center pt-6 space-x-20">
                <Button 
                  type="submit" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold text-white transition-all duration-300 bg-green-500 shadow-lg hover:bg-green-600 hover:shadow-xl hover:scale-105"
                  onClick={() => navigate('/provider')}
                >
                  Register User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold text-white transition-all duration-300 bg-orange-500 shadow-md hover:text-white hover:bg-orange-600 hover:shadow-lg hover:scale-105"
                  onClick={() => navigate('/provider/upload')}
                >
                  Add as Bulk
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;