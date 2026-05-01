import { getProfileService, updateProfileService } from "@/services/profile.service";

// 🔹 GET controller
export const getProfileController = async (email) => {
  return await getProfileService(email);
};

// 🔹 POST controller
export const updateProfileController = async (email, request) => {
  const data = await request.formData();

  const profileData = {
    fullName: data.get('fullName'),
    location: data.get('location'),
    phone: data.get('phone'),
    experience: data.get('experience'),
    desiredRole: data.get('desiredRole'),
    onlinePresence: {
      linkedin: data.get('linkedin'),
      github: data.get('github'),
      portfolio: data.get('portfolio'),
    },
  };

  // Handle profile image
  const file = data.get('profilePicture');
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    profileData.profilePicture = {
      data: buffer,
      contentType: file.type,
    };
  }

  return await updateProfileService(email, profileData);
};