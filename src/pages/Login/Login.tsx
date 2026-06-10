import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { publicRequest } from '@/utils/requestMethods';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { loginFail, loginSuccess } from '@/redux/userRedux';
import { BeatLoader } from "react-spinners";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch   = useDispatch();
  const navigateTo = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: () => {},
  });

  const loginUserMethod = (formData: any) =>
    publicRequest({ url: `/auth/login`, method: "post", data: formData });

  const { mutate: loginUser, isLoading } = useMutation('login', loginUserMethod, {
    onSuccess: (response: any) => {
      dispatch(loginSuccess(response?.data));
      navigateTo('/home/dashboard/');
    },
    onError: (error: any) => {
      dispatch(loginFail(error || undefined));
      toast.error(error.message || "Something went wrong", { position: 'bottom-right', duration: 2000 });
    },
  });

  const inputClass = `
    w-full bg-white/5 border border-[#1e1e3a] rounded-lg
    text-slate-200 placeholder:text-slate-600 text-sm
    py-2.5 pr-4 transition-all duration-200
    focus:outline-none focus:border-indigo-500/60 focus:bg-white/8
  `;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07070f]">

      {/* Subtle glow behind card */}
      <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm px-4">

        {/* Card */}
        <div className="rounded-2xl bg-[#0f0f1e] border border-[#1e1e3a] overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#1e1e3a] text-center">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form
              className="space-y-5"
              onSubmit={(e) => { e.preventDefault(); loginUser(formik.values); }}
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-medium transition-all duration-200 mt-2"
              >
                {isLoading ? <BeatLoader color="#fff" size={8} /> : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-7 text-center">
            <a href="#" className="text-xs text-slate-600 hover:text-indigo-400 transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Ratnakuthi Admin Panel · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;