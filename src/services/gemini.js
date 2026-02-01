import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getFitnessRecommendations = async (profile) => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('API_KEY_MISSING');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    당신은 "에피소드 서초/강남" 챌린지 멤버들을 위한 전문 피트니스 및 식단 코치입니다.
    다음 사용자 데이터를 바탕으로 개인화된 오늘의 식단과 운동 루틴을 추천해주세요.

    [사용자 데이터]
    - 성별: ${profile.gender === 'male' ? '남성' : '여성'}
    - 키: ${profile.height}cm
    - 몸무게: ${profile.weight}kg
    - 나이: ${profile.age}세
    - 일일 목표 칼로리: ${profile.targetCalories}kcal
    - 목표 영양소 (탄/단/지): 탄수화물 ${profile.macros.carb}g, 단백질 ${profile.macros.protein}g, 지방 ${profile.macros.fat}g
    - 선택된 트랙: ${profile.track === 'diet' ? '식단 전용' : profile.track === 'workout' ? '운동 전용' : '식단 및 운동'}
    - 활동 수준: ${profile.activity} (BMR 대비 계수)

    [요청 사항]
    1. 식단 (diet): 하루 3끼(아침, 점심, 저녁)로 나누어 추천해주세요. 각 메뉴의 이름, 예상 칼로리, 단백질 함량을 포함해야 합니다. 메뉴 이름 안에서 메인 메뉴들이 구분되도록 반드시 줄바꿈(\\n)을 포함하여 작성해주세요.
    2. 운동 (workout): 유산소 운동(러닝, 인터벌 등) 위주로 추천해주세요. 단순 명칭뿐만 아니라 페이스(예: 6분/km), 거리, 또는 인터벌 시간(예: 2분 전력 질주 후 1분 휴식) 등 구체적인 수행 방법을 포함해야 합니다.
    3. 모든 응답은 반드시 아래의 JSON 형식으로만 출력해주세요. 다른 설명 문구는 생략하세요.

    [JSON 응답 형식]
    {
      "diet": [
        {"type": "아침", "menu": "메뉴이름", "kcal": 0, "protein": 0},
        {"type": "점심", "menu": "메뉴이름", "kcal": 0, "protein": 0},
        {"type": "저녁", "menu": "메뉴이름", "kcal": 0, "protein": 0}
      ],
      "workouts": [
        {"name": "운동이름", "duration": "00분", "intensity": "강도", "description": "구체적인 페이스 및 수행 방법"}
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 추출 (Gemini가 마크다운 블록으로 줄 수 있음)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid AI Response Format');
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
