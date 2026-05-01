import FlashcardsMindmap from "@/models/flashcards_mindmap";

export const findAllMaterials = () => {
  return FlashcardsMindmap.find({}).sort({ createdAt: -1 });
};

export const createMaterial = (data) => {
  return FlashcardsMindmap.create(data);
};

export const updateMaterialById = (id, updatePayload) => {
  return FlashcardsMindmap.findByIdAndUpdate(
    id,
    updatePayload,
    { new: true, runValidators: true }
  );
};