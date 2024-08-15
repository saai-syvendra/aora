import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useState } from 'react';
import {images} from "../../constants";
import FormField from '../../components/FormField';
import CustomButton from "../../components/CustomButton";
import { Link, router } from 'expo-router';
import { getCurrentUser, signIn, signOut } from '../../lib/appwrite';
import {useGlobalContext} from '../../context/GlobalProvider'

const SignIn = () => {
  const [form, setform] = useState({
    email: "",
    password: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user, setUser, setIsLoggedIn} = useGlobalContext();

  const submit = async ()=> {
    // await signOut();
    if(!form.password || !form.email){
      Alert.alert("Error", "Please fill in all the fields!");
    }else{
      setIsSubmitting(true);
  
      try {
        await signIn(form.email, form.password);
        const result = await getCurrentUser();
        setUser(result);
        setIsLoggedIn(true);

        router.replace("/home");
      } catch (error) {
        Alert.alert("Error", error.message);
      }finally{
        setIsSubmitting(false);
      }
    }

  }


  return ( 
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center h-[85vh] px-4 my-6">
          <Image source={images.logo} resizeMode='contain' className="w-[115px] h-[35px]"/>
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">Log in to Aora</Text>
          <FormField 
            title="Email"
            value = {form.email}
            handleChangeText={(e)=> setform({...form, email: e})}
            otherStyles = "mt-7"
            keyboardType="email-address"
          />
          <FormField 
            title="Password"
            value = {form.password}
            handleChangeText={(e)=> setform({...form, password: e})}
            otherStyles = "mt-7"
          />

          <CustomButton 
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-sm text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link href="/sign-up" className='text-sm font-psemibold text-secondary'>Sign Up</Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn