import { createContext } from "react";
import "./App.css";
import { useSelector } from "react-redux";
import { useState } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Register from "./pages/Register/Register";
import Products from "./pages/Products/Products";
// import Orders from "./pages/Orders/Orders";
import Customers from "./pages/Customers/Customers";
// import Users from "./pages/Users/Users";
import Reports from "./pages/Reports/Reports";
import Analytics from "./pages/Analytics/Analytics";
import Gemblogs from "./pages/Gemblogs/Gemblogs";
import GemDetails from "./pages/Gemblogs/GemDetails";
import AddGemstone from "./pages/Gemblogs/AddGemstone";
// import EditGemstoneForm from "./components/EditGemstoneForm";
import EditGemStonePage from "./pages/Gemblogs/EditGemStonePage";
import AddProductPage from "./pages/Products/AddProductPage";
import ViewProductPage from "./pages/Products/ViewProductPage";
import EditProductPage from "./pages/Products/EditProductPage";
import Orders from "./pages/Orders/Orders";
import Astrologers from "./pages/Astrology/Astrologers";
import Appointments from "./pages/Astrology/Appointments";
import NavbarOffer from "./pages/NavbarOffer/NavbarOffer";
import Banner from "./pages/Banner/Banner";
import PoojaMetalOptions from './pages/Pooja_and_Metal/PoojaMetalOptions'

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

function App() {
  const userType = useSelector((state:any) => state.user.userType);
  // const userType = "admin"


  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    toggleTheme,
  };

  const Layout = () => {
 

    return (
      <ThemeContext.Provider value={value}>
        <div className="h-screen overflow-hidden shadow-md roboto-regular ">
          <div className="">
            <Navbar />
          </div>
          <div className="flex flex-1 ">
            <div style={{ width:"12rem" }} className="sidebar h-screen shadow-md overflow-auto">
              <Sidebar />
            </div>
            <div className="flex-1 h-screen overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </ThemeContext.Provider>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/home",
      element: userType ? <Layout /> : <Login/>,
      children: [
        {
          path: "/home/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/home/products",
          element: <Products />,
        },
        {
          path: "/home/orders",
          element: <Orders />,
        },
        {
          path: "/home/customers",
          element: <Customers />,
        },
        // {
        //   path: "/home/users",
        //   element: <Users />,
        // },
        {
          path: "/home/reports",
          element: <Reports />,
        },
        {
          path: "/home/analytics",
          element: <Analytics />,
        },
        {
          path: "/home/gemblogs",
          element: <Gemblogs />,
        },
        {
          path: "/home/gemblogs/:id",
          element: <GemDetails />,
        },
        {
          path: "/home/gemblogs/add",
          element: <AddGemstone />,
        },
        {
          path: "/home/gemblogs/edit/:id",
          element: <EditGemStonePage />,
        },
        {
          path: "/home/products/add",
          element: <AddProductPage />,
        },
        {
          path: "/home/products/view/:id",
          element: <ViewProductPage />,
        },
        {
          path: "/home/products/edit/:id",
          element: <EditProductPage />,
        },
        {
          path: "/home/astrologers",
          element: <Astrologers />,
        },
        {
          path: "/home/appointments",
          element: <Appointments />,
        },
        {
          path: "/home/navbaroffer",
          element: <NavbarOffer />,
        },
        {
          path: "/home/banner-edit",
          element: <Banner />,
        },
        {
          path: "/home/pooja-metal",
          element: < PoojaMetalOptions/>,
        },
        
      ],
    },
    {
      path: "/register",
      element: <Register />,
    },

    {
      path: "/",
      element: <Login />,
    },
    
  ]);

  return <RouterProvider router={router} />;
}

export default App;
