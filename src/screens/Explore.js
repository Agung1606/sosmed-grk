import React from "react";
import {
  View,
  TouchableOpacity,
  Pressable,
  Text,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SimpleLineIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import { styled } from "nativewind";
const StyledPressable = styled(Pressable);

import { styles } from "../style/Global";
import { scrollToTopConfig } from "../hooks";
import { TrendingCard, TweetCard, ScrollToTop } from "../components";
import { TRENDINGLISTS, EXPLORETWEETS } from "../constant";

const Explore = ({ navigation }) => {
  const goToSearchScreen = () => navigation.navigate("SearchScreen");
  const goToTrendingListScreen = () =>
    navigation.navigate("TrendingListScreen");

  const { isScrolled, reference, handleScroll, scrollToTop } =
    scrollToTopConfig({ kind: "SectionList" });

  return (
    <SafeAreaView className="flex-1">
      <SearchBar onPress={goToSearchScreen} />
      <SectionList
        ref={reference}
        onScroll={handleScroll}
        ListHeaderComponent={
          <ListOfTrendingTweets
            goToTrendingListScreen={goToTrendingListScreen}
          />
        }
        sections={EXPLORETWEETS}
        renderSectionHeader={({ section }) => (
          <View className="m-2 flex-row items-center space-x-2">
            <MaterialCommunityIcons
              name="message-text"
              size={25}
              color={"#1D7ED8"}
            />
            <Text className="font-InterSemiBold text-lg">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => <TweetCard item={item} />}
        keyExtractor={(item) => `basicListEntry-${item.id}`}
      />
      {isScrolled && <ScrollToTop onPress={scrollToTop} />}
    </SafeAreaView>
  );
};

const SearchBar = ({ onPress }) => (
  <View
    className={`flex-row ${styles.flexBetween} py-2 px-4 border-b border-gray-600`}
  >
    <TouchableOpacity>
      <SimpleLineIcons name="settings" size={22} />
    </TouchableOpacity>
    <StyledPressable
      onPress={onPress}
      className="flex-1 px-4 py-2 bg-gray-300/80 active:bg-gray-300/50 rounded-full ml-6"
    >
      <Text className="font-InterMedium text-gray-600">Cari akun</Text>
    </StyledPressable>
  </View>
);

const ListOfTrendingTweets = ({ goToTrendingListScreen }) => {
  return (
    <View className="my-2 pb-8 border-b border-gray-600">
      <Text className="mx-4 font-InterBold text-xl">Trending untuk Anda</Text>

      <View className="my-2">
        {/* only take the first 5 off list */}
        {TRENDINGLISTS.slice(0, 5).map((item) => (
          <TrendingCard
            key={item.id}
            trendingOn={item.trendingOn}
            trendingKeywords={item.trendingKeywords}
            numberOfTweets={item.numberOfTweets}
          />
        ))}
      </View>

      <TouchableOpacity onPress={goToTrendingListScreen}>
        <Text className="mx-4 text-blue font-InterMedium">
          Tampilkan lebih banyak
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Explore;
