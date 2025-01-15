import EditGemstoneForm from "@/components/EditGemstoneForm"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"


const EditGemStonePage = () => {
    const { id } = useParams()
    const navigateTo = useNavigate()

    const onSuccess = ()=>{
        toast.success("Updated!", { position: "bottom-right", duration: 2000 });
        navigateTo(`/home/gemblogs/${id}`);
    }

  return (
    <>
    <EditGemstoneForm gemstoneId={id} onSuccess={onSuccess} />
    </>
  )
}

export default EditGemStonePage