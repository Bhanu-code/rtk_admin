import { ProfileDropdown } from "./ProfileDropdown"


const Navbar = () => {
  return (
    <div className="py-3 h-10 px-10 flex items-center justify-between shadow-sm">
      <div className="logo">
        Logo
      </div>
      <div>
        <ProfileDropdown/>
      </div>
    </div>
  )
}

export default Navbar