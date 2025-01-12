import { useSelector } from "react-redux"
import { redirect } from "react-router-dom"

const Dashboard = () => {
  const userId = useSelector((state:any)=> state.user.userId)

  { !userId && redirect("/") }

  return (
   <div className="p-3">
    Dashbaord
   </div>
  )
}

export default Dashboard