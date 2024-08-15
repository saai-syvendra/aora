import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';
// Init your React Native SDK

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '66b6ec710018c057cd4b',
    databaseId: '66b6ed66001732c04709',
    userCollectionId: '66b8c45f001c3a7f7931',
    videoCollectionId: '66b8c4a10039dc8ba25d',
    storageId: '66b8c5a20030e03cebba'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId
} = config;

const client = new Client();

client
    .setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId) // Your project ID
    .setPlatform(platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username)=> {
    // Register User
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            databaseId,
            userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) =>{
    try{
        const session = await account.createEmailPasswordSession(email, password);

        return session;
    }catch(error){
        throw new Error(error);
    }
}

export const getCurrentUser = async ()=> {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt')]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.search('title', query)]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('users', userId), Query.orderDesc('$createdAt')]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        if (type==="video"){
            fileUrl = storage.getFileView(storageId, fileId);
        }else if(type==="image"){
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, "top", 100);
        }else{
            throw new Error("Invalid file type");
        }
    } catch (error) {
        throw new Error(error);   
    }

    if(!fileUrl) throw new Error;

    return fileUrl;
}

const uploadFile = async (file, type) => {
    if(!file) return;

    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    };

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            asset
        );
        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const createVideo = async (form) => {
    try {

        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, "image"),
            uploadFile(form.video, "video"),
        ]);

        const newPost = await databases.createDocument(
            databaseId,
            videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                users: form.userId
            }
        )

        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}

export const isBookmarkUser = async (videoId, userId) => {
    try {
        const response = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('$id', videoId)]
        )

        if(response.total === 0){
            throw new Error("Video not found")
        }

        const bookmarkedUsers = response.documents[0].bookmarkedUsers || [];
        return bookmarkedUsers.includes(userId);
    } catch (error) {
        throw new Error(error);
    }
}

export const bookmarkUser = async (videoId, userId) => {
    try {
        const response = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('$id', videoId)]
        )

        let bookmarkedUsers = response.documents[0].bookmarkedUsers || [];

        if(!bookmarkedUsers.includes(userId)){
            bookmarkedUsers.push(userId);
            await databases.updateDocument(
                databaseId,
                videoCollectionId,
                videoId,
                {bookmarkedUsers}
            )
        }
    } catch (error) {
        throw new Error(error);
    }
}

export const removeBookmarkUser = async (videoId, userId) => {
    try {
        const response = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('$id', videoId)]
        )

        let bookmarkedUsers = response.documents[0].bookmarkedUsers || [];

        if(bookmarkedUsers.includes(userId)){
            bookmarkedUsers = bookmarkedUsers.filter(user=> user!==userId);
            await databases.updateDocument(
                databaseId,
                videoCollectionId,
                videoId,
                {bookmarkedUsers}
            )
        }
    } catch (error) {
        throw new Error(error);
    }
}

export const getBookmarkedPosts = async (userId) =>{
    try {
        const response = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.contains('bookmarkedUsers', userId)]
        );

        if (response.total === 0) {
            console.log("No bookmarked videos found for this user.");
            return [];
        }

        return response.documents;
    } catch (error) {
        throw new Error(error);
    }
}