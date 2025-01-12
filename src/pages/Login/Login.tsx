import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { publicRequest } from '@/utils/requestMethods';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { loginFail, loginSuccess } from '@/redux/userRedux';
import { BeatLoader } from "react-spinners"

const initialValues = {
  email: "",
  password: "",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const formik = useFormik({
    initialValues,
    onSubmit: () => {
      // console.log(formik.values)
    },
  });

  const loginUserMethod = (formData: any) => {
    return publicRequest({
      url: `/auth/login`,
      method: "post",
      data: formData,
    });
  };

  const { mutate: loginUser, isLoading } = useMutation('update-basic', loginUserMethod, {
    onSuccess: (response: any) => {
      console.log(response?.data)
      dispatch(loginSuccess(response?.data));
      navigateTo('/home/dashboard/')
    },
    onError: (error: any) => {
      dispatch(loginFail(error || undefined))
      console.log(error);
      toast.error(error.message || "Something went wrong while updating", { position:'bottom-right', duration: 2000 });
    }
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200">
      <div className="w-full max-w-md px-4">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Admin Dashboard
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    placeholder="name@company.com"
                    type="email"
                    className="pl-10"
                    required
                    value={formik.values.email}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    required
                    value={formik.values.password}
                    onChange={formik.handleChange}
                  />
                  <button
                    type="submit"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" onClick={()=>{
                loginUser(formik.values)
              }}>
                { isLoading ? <BeatLoader color="blue" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              <a href="#" className="hover:text-primary">
                Forgot your password?
              </a>
            </div>
            
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;