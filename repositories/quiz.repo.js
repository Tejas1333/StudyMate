import Quiz from "@/models/Quiz";

export const findAllQuizzes = () => {
  return Quiz.find({}).sort({ createdAt: -1 });
};

export const createQuiz = (data) => {
  return Quiz.create(data);
};