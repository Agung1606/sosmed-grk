import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { modalPopupConfig } from "../../hooks";
import {
  ButtonGray,
  ButtonFollow,
  ButtonBurgerProfile,
  ProfileInfo,
  TweetCard,
  NoTweets,
  SeeProfileModal,
} from "../../components";

import { FIREBASE_FIRESTORE } from "../../../firebaseConfig";
import {
  onSnapshot,
  query,
  where,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

const HeaderVisitProfile = ({
  username,
  isMe,
  goToSettings,
  goToPrevScreen,
}) => {
  return (
    <View className={`flex-row justify-between items-center my-1 px-3`}>
      <View className={`flex-row justify-between items-center space-x-6`}>
        <TouchableOpacity onPress={goToPrevScreen}>
          <MaterialIcons name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text className="font-InterBold text-lg tracking-wide">{username}</Text>
      </View>
      {isMe ? (
        <ButtonBurgerProfile goToSettings={goToSettings} />
      ) : (
        <View className={`flex-row justify-between items-center space-x-6`}>
          <TouchableOpacity>
            <FontAwesome name="bell-o" size={25} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={25} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const VisitProfile = ({ route, navigation }) => {
  const { username, userId } = route?.params;
  const loggedInUserData = useSelector((state) => state.global.user);

  const goToEditProfile = useCallback(() => {
    navigation.navigate("EditProfileScreen");
  }, [navigation]);

  const goToSettings = useCallback(() => {
    navigation.navigate("SettingsScreen");
  }, [navigation]);

  const goToPrevScreen = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const {
    isModalOpen,
    openModal: openDetailProfile,
    closeModal: closeDetailProfile,
  } = modalPopupConfig();

  const [data, setData] = useState({});
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [myFollower, setMyFollower] = useState(false);
  const [myFollowing, setMyFollowing] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const loggedInUserFollowingRef = collection(
        FIREBASE_FIRESTORE,
        `users/${loggedInUserData.id}/following`
      );
      const otherUserFollowersRef = collection(
        FIREBASE_FIRESTORE,
        `users/${userId}/followers`
      );

      if (myFollowing) {
        const queryLoggedInUser = query(
          loggedInUserFollowingRef,
          where("userId", "==", userId)
        );
        const queryOtherUser = query(
          otherUserFollowersRef,
          where("userId", "==", loggedInUserData.id)
        );

        const [snapshotLoggedInUser, snapshotOtherUser] = await Promise.all([
          getDocs(queryLoggedInUser),
          getDocs(queryOtherUser),
        ]);

        const [loggedInFollowingDoc, otherFollowersDoc] = [
          snapshotLoggedInUser.docs[0],
          snapshotOtherUser.docs[0],
        ];

        if (loggedInFollowingDoc && otherFollowersDoc) {
          await Promise.all([
            deleteDoc(loggedInFollowingDoc.ref),
            deleteDoc(otherFollowersDoc.ref),
          ]);
        }
      } else {
        const loggedInUser = {
          userId: loggedInUserData.id,
          profile: loggedInUserData.profile,
          username: loggedInUserData.username,
        };

        const otherUser = {
          userId,
          profile: data.profile,
          username: data.username,
        };

        await Promise.all([
          addDoc(loggedInUserFollowingRef, otherUser),
          addDoc(otherUserFollowersRef, loggedInUser),
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let qUser = query(
      collection(FIREBASE_FIRESTORE, "users"),
      where("username", "==", username)
    );
    onSnapshot(qUser, (res) => {
      setData(
        res.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        })[0]
      );
    });

    let qTweets = query(
      collection(FIREBASE_FIRESTORE, "tweets"),
      where("userId", "==", userId)
    );
    onSnapshot(qTweets, (response) => {
      setTweets(
        response.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        })
      );
    });

    const followersCol = collection(
      FIREBASE_FIRESTORE,
      `users/${userId}/followers`
    );
    const followingCol = collection(
      FIREBASE_FIRESTORE,
      `users/${userId}/following`
    );

    onSnapshot(followersCol, (response) => {
      const followers = response.docs.map((doc) => doc.data());
      const isMyFollowing = followers.find(
        (item) => item.userId === loggedInUserData.id
      );
      setFollowersCount(followers.length);
      setMyFollowing(isMyFollowing);
    });

    onSnapshot(followingCol, (response) => {
      const following = response.docs.map((doc) => doc.data());
      const isMyFollower = following.find(
        (item) => item.userId === loggedInUserData.id
      );
      setFollowingCount(following.length);
      setMyFollower(isMyFollower);
    });
  }, [username, userId]);

  return (
    <SafeAreaView className="flex-1">
      <HeaderVisitProfile
        username={data.username}
        isMe={loggedInUserData.id === userId}
        goToPrevScreen={goToPrevScreen}
        goToSettings={goToSettings}
      />
      <FlatList
        ListHeaderComponent={() => (
          <View className="my-2 p-2 border-b border-gray-600">
            <ProfileInfo
              userId={userId}
              profileUrl={data.profile}
              name={data.name}
              bio={data.bio}
              openDetailProfile={openDetailProfile}
              followersCount={followersCount}
              followingCount={followingCount}
              tweetsCount={tweets.length}
            />
            {/* button */}
            <View
              className={`flex-row justify-between items-center space-x-2 mt-1`}
            >
              {loggedInUserData.id !== userId ? (
                <View className="flex-1">
                  <ButtonFollow
                    loading={loading}
                    title={
                      myFollowing
                        ? "Mengikuti"
                        : !myFollowing && myFollower
                        ? "Ikuti balik"
                        : "Ikuti"
                    }
                    isFollow={myFollowing}
                    onPress={handleFollow}
                  />
                </View>
              ) : (
                <>
                  <View className="flex-1">
                    <ButtonGray
                      title={"Edit profil"}
                      onPress={goToEditProfile}
                    />
                  </View>
                  <View className="flex-1">
                    <ButtonGray title={"Bagikan profil"} />
                  </View>
                </>
              )}
            </View>
          </View>
        )}
        data={tweets}
        renderItem={({ item }) => <TweetCard item={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <NoTweets text="Sepertinya orang ini belum membuat postingan" />
        }
      />
      {/* when user long press the profile this will triggered */}
      <SeeProfileModal
        isModalOpen={isModalOpen}
        closeModal={closeDetailProfile}
        profileUrl={data.profile}
      />
    </SafeAreaView>
  );
};

export default VisitProfile;
