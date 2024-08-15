import { useState, useEffect } from "react";
import {Alert} from "react-native";

const useAppwrite = (fn) => {
    const [data, setdata] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const fetchData = async ()=>{
      setIsLoading(true);
      try {
        const response = await fn();
        setdata(response);
      } catch (error) {
        Alert.alert("Error", error.message)
      }finally{
        setIsLoading(false);
      }
    }

    useEffect(()=>{
      fetchData();
    }, [])
  
    const refetch = ()=>fetchData();

    return {data, isLoading, refetch};
}

export default useAppwrite