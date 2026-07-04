export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "score" | "mastery" | "quest" | "social";
  condition: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  streak: number;
  bestStreak: number;
  questsDone: number;
  totalQuestions: number;
  accuracy: number;
  compositeScore: number;
  verbalScore: number;
  quantScore: number;
  diScore: number;
  topicsMastered: number;
  totalTopics: number;
  friendCount: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  { id: "streak_3", name: "3-Day Streak", description: "Study 3 days in a row", icon: "🔥", category: "streak",
    condition: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day study streak", icon: "⚡", category: "streak",
    condition: (s) => s.streak >= 7 },
  { id: "streak_30", name: "Monthly Master", description: "30-day study streak", icon: "🌟", category: "streak",
    condition: (s) => s.streak >= 30 },
  { id: "streak_best_14", name: "Two-Week Champion", description: "Achieve a 14-day best streak", icon: "🏆", category: "streak",
    condition: (s) => s.bestStreak >= 14 },

  // Quest achievements
  { id: "quest_1", name: "First Quest", description: "Complete your first daily quest", icon: "🎯", category: "quest",
    condition: (s) => s.questsDone >= 1 },
  { id: "quest_10", name: "Quest Adventurer", description: "Complete 10 daily quests", icon: "⚔️", category: "quest",
    condition: (s) => s.questsDone >= 10 },
  { id: "quest_50", name: "Quest Veteran", description: "Complete 50 daily quests", icon: "🛡️", category: "quest",
    condition: (s) => s.questsDone >= 50 },
  { id: "quest_100", name: "Quest Legend", description: "Complete 100 daily quests", icon: "👑", category: "quest",
    condition: (s) => s.questsDone >= 100 },
  { id: "questions_500", name: "500 Club", description: "Answer 500 GMAT questions", icon: "📚", category: "quest",
    condition: (s) => s.totalQuestions >= 500 },

  // Score achievements
  { id: "score_500", name: "Practitioner", description: "Reach a GMAT composite score of 505", icon: "📈", category: "score",
    condition: (s) => s.compositeScore >= 505 },
  { id: "score_600", name: "Expert Mind", description: "Reach a GMAT composite score of 605", icon: "🧠", category: "score",
    condition: (s) => s.compositeScore >= 605 },
  { id: "score_700", name: "Elite Scholar", description: "Reach a GMAT composite score of 705", icon: "💎", category: "score",
    condition: (s) => s.compositeScore >= 705 },
  { id: "verbal_80", name: "Verbal Ace", description: "Score 80+ in Verbal section", icon: "📝", category: "score",
    condition: (s) => s.verbalScore >= 80 },
  { id: "quant_80", name: "Quant Ace", description: "Score 80+ in Quantitative section", icon: "🔢", category: "score",
    condition: (s) => s.quantScore >= 80 },
  { id: "di_80", name: "Data Ace", description: "Score 80+ in Data Insights section", icon: "📊", category: "score",
    condition: (s) => s.diScore >= 80 },

  // Accuracy achievements
  { id: "accuracy_70", name: "Consistent Performer", description: "Maintain 70%+ overall accuracy", icon: "🎖️", category: "mastery",
    condition: (s) => s.accuracy >= 70 && s.totalQuestions >= 20 },
  { id: "accuracy_85", name: "Precision Thinker", description: "Maintain 85%+ overall accuracy", icon: "🏅", category: "mastery",
    condition: (s) => s.accuracy >= 85 && s.totalQuestions >= 20 },

  // Mastery achievements
  { id: "mastery_3", name: "Multi-Topic Master", description: "Master 3 GMAT topics", icon: "🎓", category: "mastery",
    condition: (s) => s.topicsMastered >= 3 },
  { id: "mastery_all", name: "Complete Mastery", description: "Master all GMAT topics", icon: "🌐", category: "mastery",
    condition: (s) => s.topicsMastered >= s.totalTopics && s.totalTopics > 0 },

  // Social
  { id: "social_friend", name: "Study Buddy", description: "Add your first friend", icon: "🤝", category: "social",
    condition: (s) => s.friendCount >= 1 },
  { id: "social_3_friends", name: "Study Group", description: "Connect with 3 friends", icon: "👥", category: "social",
    condition: (s) => s.friendCount >= 3 },
];

export function computeUnlocked(stats: AchievementStats): Set<string> {
  return new Set(ACHIEVEMENTS.filter((a) => a.condition(stats)).map((a) => a.id));
}
