import mongoose from "mongoose";
import {
  findAllMaterials,
  createMaterial,
  updateMaterialById
} from "@/repositories/flashcards.repo";

export const getMaterialsService = async () => {
  return await findAllMaterials();
};

export const createMaterialService = async (body) => {
  // Mind map optional, topic + flashcards required
  if (!body?.topic || !body?.flashcards) {
    throw new Error("MISSING_FIELDS");
  }

  try {
    return await createMaterial(body);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw new Error("VALIDATION_ERROR:" + err.message);
    }
    throw err;
  }
};

export const updateMaterialService = async ({ id, topic, flashcards }) => {
  if (!id) {
    throw new Error("MISSING_ID");
  }

  if (!topic && !flashcards) {
    throw new Error("NO_UPDATE_DATA");
  }

  const updatePayload = { $set: {} };
  if (topic) updatePayload.$set.topic = topic;
  if (flashcards) updatePayload.$set.flashcards = flashcards;

  try {
    const updated = await updateMaterialById(id, updatePayload);

    if (!updated) {
      throw new Error("NOT_FOUND");
    }

    return updated;

  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw new Error("VALIDATION_ERROR:" + err.message);
    }
    throw err;
  }
};