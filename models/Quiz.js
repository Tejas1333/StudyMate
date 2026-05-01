import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: Map, of: String, required: true },
  correct_answer: { type: String, required: true },
  explanation: { type: String },
});

const QuizSchema = new mongoose.Schema({
  topic: { type: String, required: true },

  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },

  questions: [QuestionSchema],

  userAnswers: {
  type: Object,
  required: true,
},

  // ✅ FIXED
  inputType: {
    type: String,
    enum: ["topic", "plain_text", "pdf"],
    required: true,
  },

  sourceContent: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// delete mongoose.models.Quiz;

export default mongoose.models.Quiz ||
  mongoose.model("Quiz", QuizSchema);