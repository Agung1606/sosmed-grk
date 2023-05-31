import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { EvilIcons, SimpleLineIcons } from "@expo/vector-icons";

import { loggedInUser } from "../hooks";
import { ProfileInfo, ButtonGray, TweetCard } from "../components";
import { styles } from "../style/Global";
import { TWEETS } from "../constant";

const Header = ({ username }) => {
  return (
    <View className={`flex-row ${styles.flexBetween} my-1 px-3`}>
      <Text className="font-InterBold text-xl tracking-wide">{username}</Text>
      <View className={`flex-row space-x-6`}>
        <TouchableOpacity>
          <EvilIcons name="plus" size={39} />
        </TouchableOpacity>
        <View>
          <TouchableOpacity>
            <SimpleLineIcons name="menu" size={28} />
            <View className={styles.unreadNotif}>
              <Text className="font-InterBold text-xs">1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Profile = () => {
  const { data } = loggedInUser();
  return (
    <SafeAreaView className="flex-1">
      <Header username={data.username} />
      <FlatList
        ListHeaderComponent={() => (
          <View className="mb-4 pb-4 border-b border-gray-600">
            <View className="mt-4 px-3">
              <ProfileInfo
                profileUrl={{ uri: data.profile }}
                name={data.name}
                bio={data.bio}
                numberOfTweets={TWEETS.length}
                numberOfFollowers={data.followers}
                numberOfFollowing={data.following}
              />
            </View>
            {/* button */}
            <View
              className={`flex-row ${styles.flexBetween} space-x-2 mt-1 px-3`}
            >
              <View className="flex-1">
                <ButtonGray
                  title={"Edit profile"}
                  onPress={() => alert("Open edit profile screen!")}
                />
              </View>
              <View className="flex-1">
                <ButtonGray
                  title={"Share profile"}
                  onPress={() => alert("Share profile!")}
                />
              </View>
            </View>
          </View>
        )}
        data={TWEETS}
        renderItem={({ item }) => <TweetCard item={item} />}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

export default Profile;