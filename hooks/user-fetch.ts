import { useState } from "react";
import { toast } from "sonner"
export const useFetch = (cb:any)=>{
    const [data,setData] = useState<any>(null);
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<any>(null);

    const fn = async(...args:any)=>{
        setLoading(true);
        setError(null);
        try {
            const response = await cb(...args);
            setData(response);
            setLoading(false);
            setError(null);

        } catch (error:any) {
            console.log(error)
            toast.error(error.message as string || error)
            setError(error);
            setLoading(false);
            
        }finally{
            setLoading(false)
        }
      
    }
    return {data,loading,fn,error,setData}
}
