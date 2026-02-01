import { useState, useCallback } from 'react';

export const useFitness = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('fitness-profile');
    const initialState = {
      nickname: '',
      height: '',
      weight: '',
      gender: 'male',
      age: '25',
      activity: '1.2',
      deficit: '10',
      track: 'both', // 'diet', 'workout', 'both'
      points: 0,
      certs: {
        diet: [], // up to 3 images
        workout: null // 1 image
      },
      bmr: '',
      tdee: '',
      targetCalories: '',
      macros: {
        carb: 0,
        protein: 0,
        fat: 0
      }
    };

    let data = saved ? JSON.parse(saved) : initialState;

    // Monthly reset logic: Reset points on the 1st of every month
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const lastReset = localStorage.getItem('last-reset-month');

    if (today.getDate() === 1 && lastReset !== currentMonth) {
      data.points = 0;
      localStorage.setItem('last-reset-month', currentMonth);
      localStorage.setItem('fitness-profile', JSON.stringify(data));
    }

    return data;
  });

  const calculateFitness = useCallback((data) => {
    const { height, weight, gender, age, activity, deficit } = data;

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * parseFloat(activity);
    const targetCalories = tdee * (1 - (parseInt(deficit) / 100));

    // Macro Calculation
    // Protein: Male x2, Female x1.5
    const proteinGrams = gender === 'male' ? weight * 2 : weight * 1.5;
    const proteinKcal = proteinGrams * 4;

    // Fat: 25% of target calories
    const fatKcal = targetCalories * 0.25;
    const fatGrams = fatKcal / 9;

    // Carbs: Remainder
    const carbKcal = targetCalories - proteinKcal - fatKcal;
    const carbGrams = Math.max(0, carbKcal / 4);

    const newProfile = {
      ...data,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros: {
        protein: Math.round(proteinGrams),
        fat: Math.round(fatGrams),
        carb: Math.round(carbGrams)
      }
    };

    setProfile(newProfile);
    localStorage.setItem('fitness-profile', JSON.stringify(newProfile));
    return newProfile;
  }, []);

  return { profile, setProfile, calculateFitness };
};
