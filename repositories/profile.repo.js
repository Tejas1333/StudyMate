import UserProfile from "@/models/UserProfile";

export const findProfileByEmail = async (email) => {
  return await UserProfile.findOne({ email }).lean();
};

export const upsertProfileByEmail = async (email, profileData) => {
  return await UserProfile.findOneAndUpdate(
    { email },
    { $set: profileData },
    { new: true, upsert: true, runValidators: true }
  );
};