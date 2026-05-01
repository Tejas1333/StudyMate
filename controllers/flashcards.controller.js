import {
  getMaterialsService,
  createMaterialService,
  updateMaterialService
} from "@/services/flashcards.service";

export const getMaterialsController = async () => {
  return await getMaterialsService();
};

export const createMaterialController = async (req) => {
  const body = await req.json();
  return await createMaterialService(body);
};

export const updateMaterialController = async (req) => {
  const body = await req.json();
  return await updateMaterialService(body);
};