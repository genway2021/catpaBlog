package model

import (
	"time"
)

// Article 文章模型
type Article struct {
	ID          uint       `gorm:"primarykey" json:"id"`
	Title       string     `gorm:"size:200" json:"title"`
	Slug        string     `gorm:"uniqueIndex;size:200" json:"slug"`
	Content     string     `gorm:"type:text" json:"content"`
	Summary     string     `gorm:"size:500" json:"summary"`
	AISummary   string     `gorm:"type:text" json:"ai_summary"` // AI生成的总结
	Cover       string     `gorm:"size:255" json:"cover"`
	Location    string     `gorm:"size:100" json:"location"`        // 发布地点
	IsPublish   bool       `gorm:"default:false" json:"is_publish"` // 是否发布
	IsTop       bool       `gorm:"default:false" json:"is_top"`
	IsEssence   bool       `gorm:"default:false" json:"is_essence"`  // 是否精选
	IsOutdated  bool       `gorm:"default:false" json:"is_outdated"` // 是否过时
	ViewCount   int        `gorm:"default:0" json:"view_count"`
	PublishTime *time.Time `json:"publish_time"` // 文章发布时间
	UpdateTime  *time.Time `json:"update_time"`  // 文章修改时间
	CategoryID  *uint      `json:"category_id"`
	Category    Category   `json:"category"`
	Tags        []Tag      `gorm:"many2many:article_tags" json:"tags"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
