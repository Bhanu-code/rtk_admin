
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/redux/userRedux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import pic from "../assets/react.svg"

export function ProfileDropdown() {
  const navigateTo = useNavigate()

  const firstName = useSelector((state:any)=> state.user.firstName)
  const lastName = useSelector((state:any)=> state.user.lastName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <img src={pic} className="size-8 border rounded-full inline" alt="profile_pic" />
          {" "}
          <span>{firstName}{" "}{lastName}</span>
          {/* <IoMdArrowDropdown/> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>
          <button onClick={()=>{
            logOut();
            navigateTo("/")
          }}>

          Log out
          </button>
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
