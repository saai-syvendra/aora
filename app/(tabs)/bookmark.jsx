import { View, Text, FlatList} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import React, { useCallback } from 'react'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import {getBookmarkedPosts} from "../../lib/appwrite"
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import {useGlobalContext} from '../../context/GlobalProvider'
import { useFocusEffect } from '@react-navigation/native';
import Loader from "../../components/Loader"

const Bookmark = () => {
  const {user} = useGlobalContext();
  const {data: posts, refetch, isLoading} = useAppwrite(()=>getBookmarkedPosts(user.$id));
  
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  )

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id }
        renderItem={({item}) => (
          <VideoCard
            video={item}
            onBookmarkChange={refetch}
          />
        )}  
        ListHeaderComponent={()=>(
          <View className="my-6 px-4">
            <Text className="font-pbold text-2xl text-gray-100 mb-5 mt-2">
              Bookmarked Videos
            </Text>

            {/* <View className="mt-6 mb-8">
              <SearchInput
                placeholder={"Search from bookmarked videos"}
              />
            </View> */}
          </View>
        )}
        ListEmptyComponent={()=> (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
      />

    <Loader isLoading={isLoading} />
    </SafeAreaView>
  )
}

export default Bookmark