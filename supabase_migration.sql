-- ============================================
-- Challenge Epi - Supabase Migration Script
-- Supabase SQL Editor에서 이 스크립트를 실행하세요
-- ============================================

-- UUID 생성 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS "Profile" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT UNIQUE NOT NULL,
  gender TEXT,
  height DOUBLE PRECISION,
  weight DOUBLE PRECISION,
  age INTEGER,
  activity DOUBLE PRECISION,
  deficit INTEGER,
  track TEXT,
  points INTEGER DEFAULT 0,
  password TEXT,
  bmr DOUBLE PRECISION,
  "targetCalories" DOUBLE PRECISION,
  "profileImage" TEXT,
  status TEXT DEFAULT '오늘도 건강하게!',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "InBodyRecord" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"(id) ON DELETE CASCADE,
  weight DOUBLE PRECISION NOT NULL,
  muscle DOUBLE PRECISION NOT NULL,
  fat DOUBLE PRECISION NOT NULL,
  date TEXT NOT NULL,
  day TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Certification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "pointsAwarded" INTEGER DEFAULT 10,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Post" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  image TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Comment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId" UUID NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
  "profileId" UUID NOT NULL REFERENCES "Profile"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Like" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId" UUID NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
  "profileId" UUID NOT NULL REFERENCES "Profile"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("postId", "profileId")
);

-- ============================================
-- 2. Row Level Security (RLS) 정책
-- 앱 자체 인증(닉네임/비밀번호)을 사용하므로
-- anon 키로 모든 접근 허용
-- ============================================

ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InBodyRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Certification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON "Profile" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "InBodyRecord" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Certification" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Post" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Comment" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Like" FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- 3. 헬퍼 함수 (RPC)
-- ============================================

-- 포인트 안전하게 차감 (0 미만 방지)
CREATE OR REPLACE FUNCTION decrement_points(profile_id UUID, amount INTEGER DEFAULT 10)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE "Profile"
  SET points = GREATEST(0, points - amount), "updatedAt" = NOW()
  WHERE id = profile_id;
END;
$$;

-- 전체 유저 포인트 리셋 (월간)
CREATE OR REPLACE FUNCTION reset_all_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE "Profile" SET points = 0;
END;
$$;

-- 게시글 좋아요 수 업데이트
CREATE OR REPLACE FUNCTION update_post_likes(post_id UUID, amount INTEGER DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE "Post" SET likes = GREATEST(0, likes + amount) WHERE id = post_id;
END;
$$;
