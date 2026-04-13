-- 移除分类和标签表中的 count 字段
-- 文章数量现在改为实时统计，不再需要冗余存储

ALTER TABLE categories DROP COLUMN IF EXISTS count;
ALTER TABLE tags DROP COLUMN IF EXISTS count;
