import {
  getQuizHistoryService,
  createQuizService
} from "@/services/quiz.service";

export const getQuizHistoryController = async () => {
  return await getQuizHistoryService();
};

export const createQuizController = async (req) => {
  const body = await req.json();
  return await createQuizService(body);
};