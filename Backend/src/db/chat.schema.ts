import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: string;
  content?: string;
  problem?: string;
  modelA?: string;
  modelB?: string;
  solution_1?: string;
  solution_2?: string;
  judgeWinner?: string;
  manualWinner?: string;
  isError?: boolean;
  judge?: {
    solution_1_score: number;
    solution_2_score: number;
    solution_1_reasoing: string;
    solution_2_resoning: string;
  };
  timestamp?: Date;
}

export interface IChat extends Document {
  chatId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  role: { type: String, required: true },
  content: { type: String },
  problem: { type: String },
  modelA: { type: String },
  modelB: { type: String },
  solution_1: { type: String },
  solution_2: { type: String },
  judgeWinner: { type: String },
  manualWinner: { type: String },
  isError: { type: Boolean, default: false },
  judge: {
    solution_1_score: { type: Number, default: 0 },
    solution_2_score: { type: Number, default: 0 },
    solution_1_reasoing: { type: String, default: '' },
    solution_2_resoning: { type: String, default: '' }
  },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new Schema(
  {
    chatId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'New AI Battle' },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

export const ChatModel = mongoose.models.BattleChat || mongoose.model<IChat>('BattleChat', ChatSchema);
