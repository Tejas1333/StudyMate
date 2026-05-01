import {
  getQuizHistoryService,
  createQuizService
} from "@/services/quiz.service";

export const getQuizHistoryController = async () => {
  return await getQuizHistoryService();
};

export const createQuizController = async (req) => {
  const body = await req.json();

  // 🔥 DEBUG (IMPORTANT)
  console.log("🔥 Incoming quiz save:", body);

  return await createQuizService(body);
};