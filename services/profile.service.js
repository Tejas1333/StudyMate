import { findProfileByEmail, upsertProfileByEmail } from "@/repositories/profile.repo";

export const getProfileService = async (email) => {
  const userProfile = await findProfileByEmail(email);

  if (!userProfile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  // Convert Buffer → Base64
  if (userProfile.profilePicture?.data) {
    userProfile.profilePictureUrl = `data:${userProfile.profilePicture.contentType};base64,${userProfile.profilePicture.data.toString('base64')}`;
    delete userProfile.profilePicture;
  }

  return userProfile;
};

export const updateProfileService = async (email, profileData) => {
  return await upsertProfileByEmail(email, profileData);
};