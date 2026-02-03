-- Like 테이블 생성 (사용자당 게시물 하나에 좋아요 1회로 제한)
CREATE TABLE IF NOT EXISTS "Like" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "postId" UUID NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
    "profileId" UUID NOT NULL REFERENCES "Profile"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("postId", "profileId")
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_like_post_id ON "Like"("postId");
CREATE INDEX IF NOT EXISTS idx_like_profile_id ON "Like"("profileId");
