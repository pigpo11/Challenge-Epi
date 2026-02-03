import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import sql from '../services/database';

const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('fitness-profile');
    const initialState = {
      dbId: localStorage.getItem('fitness-db-id') || '',
      nickname: '',
      height: '',
      weight: '',
      gender: 'male',
      age: '25',
      profileImage: null,
      activity: '1.2',
      deficit: '10',
      password: '',
      track: 'both', // 'diet', 'workout', 'both'
      status: '오늘도 건강하게!',
      points: 0,
      certs: {
        diet: [], // up to 3 images
        workout: null // 1 image
      },
      inbodyRecords: [], // { date, weight, muscle, fat }
      bmr: '',
      tdee: '',
      targetCalories: '',
      macros: {
        carb: 0,
        protein: 0,
        fat: 0
      },
      todayPlan: null, // Store AI recommended diet/workout
      isSetup: false    // Flag to track onboarding completion
    };

    let data = saved ? { ...initialState, ...JSON.parse(saved) } : initialState;

    // Ensure the dbId is always picked up from its dedicated key if present
    const savedDbId = localStorage.getItem('fitness-db-id');
    if (savedDbId) data.dbId = savedDbId;

    // Monthly points reset, Daily certifications reset
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const lastResetMonth = localStorage.getItem('last-reset-month');
    const lastResetDate = localStorage.getItem('last-reset-date');

    // 1. Monthly points reset
    if (lastResetMonth && lastResetMonth !== currentMonth) {
      data.points = 0;
      localStorage.setItem('last-reset-month', currentMonth);
    } else if (!lastResetMonth) {
      localStorage.setItem('last-reset-month', currentMonth);
    }

    // 2. Daily certifications reset (Dashboard focus for today)
    if (lastResetDate && lastResetDate !== currentDate) {
      data.certs = { diet: [], workout: null };
      localStorage.setItem('last-reset-date', currentDate);
    } else if (!lastResetDate) {
      localStorage.setItem('last-reset-date', currentDate);
    }

    if (lastResetMonth !== currentMonth || lastResetDate !== currentDate) {
      localStorage.setItem('fitness-profile', JSON.stringify(data));
    }

    return data;
  });

  // Monthly Reset Effect
  useEffect(() => {
    const handleMonthlyReset = async () => {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
      const lastReset = localStorage.getItem('last-reset-month');

      if (lastReset && lastReset !== currentMonth && profile.dbId) {
        try {
          // 1. Reset my points in DB
          await sql`UPDATE "Profile" SET points = 0 WHERE id = ${profile.dbId}`;

          // 2. (Optional but recommended) Reset ALL users if not already done this month
          // We can use a simple check to see if anyone else has a high score or use a dedicated settings table
          // Since we want the "Ranking" to be 0 for everyone, a global reset is cleanest if the user is the first to log in.
          // To prevent multiple global resets, we can check if a "global-reset-done" flag exists for this month in DB.
          // For simplicity and to ensure the user's requirement:
          // "나의 포인트랑 랭킹 둘 다 0pts가 되게" -> Reset my points. 
          // If everyone does this, the ranking naturally resets. 
          // But to make it feel instant for the ranking:
          await sql`UPDATE "Profile" SET points = 0`;

          console.log('Monthly Reset Completed');
          localStorage.setItem('last-reset-month', currentMonth);
        } catch (err) {
          console.error('Monthly reset sync failed:', err);
        }
      }
    };

    handleMonthlyReset();
  }, [profile.dbId]);

  const logout = useCallback(() => {
    setProfile({
      dbId: '',
      nickname: '',
      height: '',
      weight: '',
      gender: 'male',
      age: '25',
      profileImage: null,
      activity: '1.2',
      deficit: '10',
      password: '',
      track: 'both',
      status: '오늘도 건강하게!',
      points: 0,
      certs: { diet: [], workout: null },
      inbodyRecords: [],
      bmr: '',
      tdee: '',
      targetCalories: '',
      macros: { carb: 0, protein: 0, fat: 0 },
      isSetup: false
    });
    localStorage.removeItem('fitness-profile');
    localStorage.removeItem('fitness-db-id');
  }, []);

  const login = useCallback(async (nickname, password) => {
    try {
      const results = await sql`SELECT * FROM "Profile" WHERE nickname = ${nickname} AND password = ${password}`;
      if (results && results[0]) {
        const dbProfile = results[0];
        const newProfile = {
          ...dbProfile,
          dbId: dbProfile.id,
          isSetup: true,
          certs: { diet: [], workout: null }, // Daily certs are local usually
          inbodyRecords: [] // Fetched separately if needed
        };
        setProfile(newProfile);
        localStorage.setItem('fitness-profile', JSON.stringify(newProfile));
        localStorage.setItem('fitness-db-id', dbProfile.id);
        return { success: true };
      }
      return { success: false, message: '닉네임 또는 비밀번호가 일치하지 않습니다.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: '서버 오류가 발생했습니다.' };
    }
  }, []);

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
    const proteinGrams = gender === 'male' ? weight * 2 : weight * 1.5;
    const proteinKcal = proteinGrams * 4;
    const fatKcal = targetCalories * 0.25;
    const fatGrams = fatKcal / 9;
    const carbKcal = targetCalories - proteinKcal - fatKcal;
    const carbGrams = Math.max(0, carbKcal / 4);

    const newProfile = {
      ...profile, // Keep existing fields like profileImage
      ...data,    // Overwrite with new form data
      nickname: data.nickname || profile.nickname, // Ensure nickname is never lost
      height: parseFloat(data.height) || profile.height,
      bmr: bmr ? Math.round(bmr) : profile.bmr,
      tdee: tdee ? Math.round(tdee) : profile.tdee,
      targetCalories: targetCalories ? Math.round(targetCalories) : profile.targetCalories,
      macros: {
        protein: proteinGrams ? Math.round(proteinGrams) : profile.macros.protein,
        fat: fatGrams ? Math.round(fatGrams) : profile.macros.fat,
        carb: carbGrams ? Math.round(carbGrams) : profile.macros.carb
      },
      isSetup: true
    };

    setProfile(newProfile);
    localStorage.setItem('fitness-profile', JSON.stringify(newProfile));

    // Sync to DB
    const syncToDb = async (p) => {
      try {
        if (p.dbId) {
          await sql`
            UPDATE "Profile" SET
              nickname = ${p.nickname},
              gender = ${p.gender},
              height = ${parseFloat(p.height)},
              weight = ${parseFloat(p.weight)},
              age = ${parseInt(p.age)},
              activity = ${parseFloat(p.activity)},
              deficit = ${parseInt(p.deficit)},
              track = ${p.track},
              points = ${p.points},
              password = ${p.password},
              bmr = ${p.bmr},
              "targetCalories" = ${p.targetCalories},
              status = ${p.status},
              "updatedAt" = NOW()
            WHERE id = ${p.dbId}
          `;
        } else {
          const result = await sql`
            INSERT INTO "Profile" (
              id, nickname, gender, height, weight, age, activity, deficit, track, points, password, bmr, "targetCalories", status, "createdAt", "updatedAt"
            ) VALUES (
              gen_random_uuid(), ${p.nickname}, ${p.gender}, ${parseFloat(p.height)}, ${parseFloat(p.weight)}, ${parseInt(p.age)}, ${parseFloat(p.activity)}, ${parseInt(p.deficit)}, ${p.track}, ${p.points}, ${p.password}, ${p.bmr}, ${p.targetCalories}, ${p.status}, NOW(), NOW()
            ) RETURNING id
          `;
          if (result && result[0]) {
            const newDbId = result[0].id;
            localStorage.setItem('fitness-db-id', newDbId);
            setProfile(prev => ({ ...prev, dbId: newDbId }));
          }
        }
      } catch (error) {
        console.error('Failed to sync to DB:', error);
      }
    };

    syncToDb(newProfile);

    return newProfile;
  }, [profile]);

  const updatePoints = useCallback(async (amount) => {
    const newPoints = profile.points + amount;
    const newProfile = { ...profile, points: newPoints };
    setProfile(newProfile);
    localStorage.setItem('fitness-profile', JSON.stringify(newProfile));

    if (profile.dbId) {
      try {
        await sql`UPDATE "Profile" SET points = ${newPoints}, "updatedAt" = NOW() WHERE id = ${profile.dbId}`;
      } catch (err) {
        console.error('Score sync failed:', err);
      }
    }
  }, [profile]);

  return (
    <FitnessContext.Provider value={{ profile, setProfile, calculateFitness, updatePoints, login, logout }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
