import { useEffect } from "react"
import { useSelector } from "react-redux"
import { redirect } from "react-router-dom"


const Redirect = () => {
    const userId = useSelector((state:any)=> state.user.userId)
    useEffect(() => {
      !userId && redirect("/")
    
    }, [])
    
  return (
    <div></div>
  )
}

export default Redirect