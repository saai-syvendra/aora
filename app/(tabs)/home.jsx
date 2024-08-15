import { View, Text, ScrollView, FlatList, Image, RefreshControl, Alert } from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import React, { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import {images} from "../../constants"
import SearchInput from '../../components/SearchInput'
import Trending from '../../components/Trending'
import EmptyState from '../../components/EmptyState'
import {getAllPosts, getLatestPosts} from "../../lib/appwrite"
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import {useGlobalContext} from '../../context/GlobalProvider'
import Loader from '../../components/Loader';

const Home = () => {
  const {data: posts, refetch: refetchAllPosts, isLoading: loading1} = useAppwrite(getAllPosts);
  const {data: latestPosts, refetch: refetchTrendingPosts, isLoading: loading2} = useAppwrite(getLatestPosts);
  const [refreshing, setRefreshing] = useState(false);
  const {user } = useGlobalContext();

  const [refreshKey, setRefreshKey] = useState(0); 

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prevKey => prevKey + 1); 
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAllPosts();
    await refetchTrendingPosts();
    setRefreshing(false);
  }
  
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id }
        renderItem={({item}) => (
          <VideoCard
            key={refreshKey}
            video={item}
          />
        )}  
        ListHeaderComponent={()=>(
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome back,
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode='contain'
                />
              </View>

            </View>

            <SearchInput
              placeholder="Search for a video topic"
            />
            <View className="w-full flex-1 pt-7 pb-8">
              <Text className="text-gray-100 tex-lg font-pregular">Latest Videos</Text>

              <Trending
                posts = {latestPosts}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={()=> (
          <EmptyState
            title="No Videos Found"
            subtitle="Be the first one to upload a video"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      />

    <Loader isLoading={refreshing || loading1 || loading2} />
    </SafeAreaView>
  )
}

export default Home