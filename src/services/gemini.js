import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// 사용 가능한 모든 고성능 모델 후보군
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.0-pro-exp-02-05",
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001"
];

export const getFitnessRecommendations = async (profile) => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  const prompt = `
    당신은 "에피소드 서초/강남" 챌린지 멤버들을 위한 전문 피트니스 및 식단 코치입니다.
    사용자 데이터(${profile.height}cm, ${profile.weight}kg, ${profile.age}세, ${profile.targetCalories}kcal)를 바탕으로 개인화된 오늘의 식단과 운동 루틴을 JSON 형식으로 추천해주세요.

    [중요 운동 지침]
    - 반드시 **러닝, 유산소, 인터벌 트레이닝** 위주로만 추천하세요.
    - 데드리프트, 스쿼트, 벤치프레스 같은 근력 운동(웨이트 트레이닝)은 절대 포함하지 마세요.
    - 러닝의 경우 페이스(예: 6:00/km), 거리, 또는 구체적인 인터벌 시간(예: 2분 질주 후 1분 휴식)을 명시하세요.
    - 수행 방법(description)에는 줄바꿈(\\n)을 포함하여 가독성 있게 작성하세요.

    [JSON 응답 형식]
    {
      "diet": [
        {"type": "아침", "menu": "메뉴이름", "kcal": 0, "protein": 0},
        {"type": "점심", "menu": "메뉴이름", "kcal": 0, "protein": 0},
        {"type": "저녁", "menu": "메뉴이름", "kcal": 0, "protein": 0}
      ],
      "workouts": [
        {"name": "운동이름", "duration": "00분", "intensity": "강도", "description": "구체적인 방법"}
      ]
    }
  `;

  let lastErrorMessage = "";

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      lastErrorMessage = error.message;
      console.warn(`Model ${modelName} failed:`, lastErrorMessage);
      continue;
    }
  }

  throw new Error(lastErrorMessage.includes('429')
    ? '현재 구글 API 무료 티어 할당량이 모두 소진되었습니다. 내일 이용해 주세요.'
    : lastErrorMessage);
};
