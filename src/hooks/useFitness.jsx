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

  // Helper to re-calculate BMR, TDEE, Calories, and Macros from raw profile data
  const getCalculatedStats = useCallback((data) => {
    const { height, weight, gender, age, activity, deficit } = data;
    if (!height || !weight || !age) return null;

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
    } else {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;
    }

    const tdee = bmr * parseFloat(activity || 1.2);
    const targetCalories = tdee * (1 - (parseInt(deficit || 10) / 100));

    // Macro Calculation
    const proteinGrams = gender === 'male' ? weight * 2 : weight * 1.5;
    const proteinKcal = proteinGrams * 4;
    const fatKcal = targetCalories * 0.25;
    const fatGrams = fatKcal / 9;
    const carbKcal = targetCalories - proteinKcal - fatKcal;
    const carbGrams = Math.max(0, carbKcal / 4);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros: {
        protein: Math.round(proteinGrams),
        fat: Math.round(fatGrams),
        carb: Math.round(carbGrams)
      }
    };
  }, []);

  // 1. Initial Load Effect: Sync from DB if dbId exists
  useEffect(() => {
    const syncFromDb = async () => {
      if (profile.dbId) {
        try {
          const results = await sql`SELECT * FROM "Profile" WHERE id = ${profile.dbId}`;
          if (results && results[0]) {
            const dbProfile = results[0];
            const stats = getCalculatedStats(dbProfile);

            setProfile(prev => ({
              ...prev,
              ...dbProfile,
              ...stats, // Recalculate macros/calories on the fly
              dbId: dbProfile.id,
              isSetup: true
            }));
          }
        } catch (err) {
          console.error('Initial sync from DB failed:', err);
        }
      }
    };
    syncFromDb();
  }, [getCalculatedStats]); // Depend on the memoized helper

  // 2. Persistence Effect: Keep localStorage in sync with profile state
  useEffect(() => {
    if (profile.isSetup) {
      localStorage.setItem('fitness-profile', JSON.stringify(profile));
      if (profile.dbId) {
        localStorage.setItem('fitness-db-id', profile.dbId);
      }
    }
  }, [profile]);

  // Monthly Reset Effect
  useEffect(() => {
    const handleMonthlyReset = async () => {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
      const lastReset = localStorage.getItem('last-reset-month');

      if (lastReset && lastReset !== currentMonth && profile.dbId) {
        try {
          // Reset ALL users for the new month challenge
          await sql`UPDATE "Profile" SET points = 0`;

          console.log('Monthly Reset Completed');
          localStorage.setItem('last-reset-month', currentMonth);
          setProfile(prev => ({ ...prev, points: 0 }));
        } catch (err) {
          console.error('Monthly reset sync failed:', err);
        }
      }
    };

    handleMonthlyReset();
  }, [profile.dbId]);

  const logout = useCallback(() => {
    const initialState = {
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
    };
    setProfile(initialState);
    localStorage.removeItem('fitness-profile');
    localStorage.removeItem('fitness-db-id');
    localStorage.removeItem('last-reset-month');
    localStorage.removeItem('last-reset-date');
  }, []);

  const login = useCallback(async (nickname, password) => {
    try {
      const results = await sql`SELECT * FROM "Profile" WHERE nickname = ${nickname} AND password = ${password}`;
      if (results && results[0]) {
        const dbProfile = results[0];
        const stats = getCalculatedStats(dbProfile);
        const newProfile = {
          ...dbProfile,
          ...stats,
          dbId: dbProfile.id,
          isSetup: true,
          certs: { diet: [], workout: null },
          inbodyRecords: []
        };
        setProfile(newProfile);
        return { success: true };
      }
      return { success: false, message: '닉네임 또는 비밀번호가 일치하지 않습니다.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: '서버 오류가 발생했습니다.' };
    }
  }, [getCalculatedStats]);

  const calculateFitness = useCallback(async (data) => {
    const stats = getCalculatedStats(data);

    const newProfile = {
      ...profile,
      ...data,
      ...stats,
      isSetup: true
    };

    // Await sync to DB to ensure we have a dbId before returning/navigating
    try {
      if (newProfile.dbId) {
        await sql`
          UPDATE "Profile" SET
            nickname = ${newProfile.nickname},
            gender = ${newProfile.gender},
            height = ${parseFloat(newProfile.height)},
            weight = ${parseFloat(newProfile.weight)},
            age = ${parseInt(newProfile.age)},
            activity = ${parseFloat(newProfile.activity)},
            deficit = ${parseInt(newProfile.deficit)},
            track = ${newProfile.track},
            points = ${newProfile.points},
            password = ${newProfile.password},
            bmr = ${newProfile.bmr},
            "targetCalories" = ${newProfile.targetCalories},
            status = ${newProfile.status},
            "updatedAt" = NOW()
          WHERE id = ${newProfile.dbId}
        `;
      } else {
        const result = await sql`
          INSERT INTO "Profile" (
            id, nickname, gender, height, weight, age, activity, deficit, track, points, password, bmr, "targetCalories", status, "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), ${newProfile.nickname}, ${newProfile.gender}, ${parseFloat(newProfile.height)}, ${parseFloat(newProfile.weight)}, ${parseInt(newProfile.age)}, ${parseFloat(newProfile.activity)}, ${parseInt(newProfile.deficit)}, ${newProfile.track}, ${newProfile.points}, ${newProfile.password}, ${newProfile.bmr}, ${newProfile.targetCalories}, ${newProfile.status}, NOW(), NOW()
          ) RETURNING id
        `;
        if (result && result[0]) {
          newProfile.dbId = result[0].id;
        }
      }
    } catch (error) {
      console.error('Failed to sync to DB:', error);
    }

    setProfile(newProfile);
    return newProfile;
  }, [profile, getCalculatedStats]);

  const updatePoints = useCallback(async (amount) => {
    setProfile(prev => {
      const newPoints = prev.points + amount;
      const newProfile = { ...prev, points: newPoints };

      if (prev.dbId) {
        sql`UPDATE "Profile" SET points = ${newPoints}, "updatedAt" = NOW() WHERE id = ${prev.dbId}`
          .catch(err => console.error('Score sync failed:', err));
      }

      return newProfile;
    });
  }, []);

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
