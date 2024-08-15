import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import {icons} from "../constants"
import { Video, ResizeMode } from 'expo-av'
import Ionicons from '@expo/vector-icons/Ionicons';
import { styled } from 'nativewind';
import { bookmarkUser, isBookmarkUser, removeBookmarkUser } from '../lib/appwrite';
import {useGlobalContext} from '../context/GlobalProvider'


const StyledIonicons = styled(Ionicons);

const VideoCard = ({video: {$id: videoId, title, thumbnail, video, users: {username, avatar}}, onBookmarkChange}) => {
    const [play, setPlay] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const {user} = useGlobalContext();
    
    useEffect(() => {
        const checkUser = async ()=> {
            const result = await isBookmarkUser(videoId, user.$id)
            setIsBookmarked(result);
        }
        checkUser();
    }, [])

    const handleBookmark = async (toBeBookmarked)=> {
        
        if(toBeBookmarked){
            await bookmarkUser(videoId, user.$id);
            setIsBookmarked(true);
        }else{
            await removeBookmarkUser(videoId, user.$id);
            setIsBookmarked(false);
        }
        
        if (onBookmarkChange) {
            onBookmarkChange();
        }
    }
    
    return (
    <View className="flex-col items-center px-4 mb-14">
        <View className="flex-row gap-3 items-start">
            <View className="justify-center items-center flex-row flex-1">
                <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                    <Image
                        source={{uri: avatar}}
                        className="w-full h-full rounded-lg"
                        resizeMode='cover'
                    />
                </View>
                <View className="justify-center flex-1 ml-3 gap-y-1">
                    <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
                        {title}
                    </Text>
                    <Text className="text-xs text-gray-100 font-pregular">
                        {username}
                    </Text>
                </View>
            </View>

            <View className="pt-2" >
                {/* <Image
                    source={icons.menu}
                    className="w-5 h-5"
                    resizeMode='contain'
                /> */}
                {isBookmarked ? (
                    <StyledIonicons
                    name='bookmark'
                    size={32}
                    className='text-gray-100'
                    onPress={()=>handleBookmark(false)}
                />
                ) : (
                    <StyledIonicons
                        name='bookmark-outline'
                        size={32}
                        className='text-gray-100'
                        onPress={()=>handleBookmark(true)}
                    />
                )}

            </View>
        </View>

        {play ? (
            <Video
                source={{uri: video}}
                className="w-full h-60 rounded-xl mt-3"
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
                onPlaybackStatusUpdate={(status) => {
                if(status.didJustFinish){
                    setPlay(false);
                }
            }}
          />
        ): (
            <TouchableOpacity
                className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
                activeOpacity={0.7}
                onPress={()=> setPlay(true)}
            >
                <Image
                    source={{uri: thumbnail}}
                    className="w-full h-full rounded-xl mt-3"
                    resizeMode='cover'
                />
                <Image
                    source={icons.play}
                    className="w-12 h-12 absolute"
                    resizeMode='contain'
                />
            </TouchableOpacity>
        )}
    </View>
  )
}

export default VideoCard