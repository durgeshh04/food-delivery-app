import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { getCurrentUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProfileData = {
  fullname: string;
  email: string;
  phone?: string;
  address1?: string;
  address2?: string;
  avatar?: string;
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user?.profile) setProfile(user.profile as any);
    };
    loadUser();
  }, []);
  const { logout } = useAuthStore();
  const handleLogout = async () => {
    await logout();
    router.replace("/sign-in");
  };

  const fields = profile
    ? [
        { label: "Full Name", value: profile.fullname },
        { label: "Email", value: profile.email },
        { label: "Phone", value: profile.phone || "-" },
        { label: "Address 1", value: profile.address1 || "-" },
        { label: "Address 2", value: profile.address2 || "-" },
      ]
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <FlatList
        data={fields}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View className="mb-4">
            <Text className="text-gray-400 text-sm">{item.label}</Text>
            <Text className="text-dark-100 text-base font-semibold mt-1">
              {item.value}
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View>
            <CustomHeader title="Profile" />

            {/* Avatar */}
            <View className="items-center mt-5">
              <Image
                source={{
                  uri: profile?.avatar || "https://i.pravatar.cc/300",
                }}
                className="size-28 rounded-full"
              />
            </View>

            {/* Card container */}
            <View className="bg-white rounded-2xl p-5 shadow-md shadow-black/5 mt-6">
              <Text className="h3-bold text-dark-100 mb-4">
                User Information
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="mt-6">
            <CustomButton
              title="Logout"
              style="mt-3 border border-red-400"
              textStyle="text-red-400"
              onPress={handleLogout}
            />
          </View>
        )}
        contentContainerClassName="pb-10"
      />
    </SafeAreaView>
  );
};

export default Profile;
