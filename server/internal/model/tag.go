package model

import (
	"time"
)

// Tag 标签模型
type Tag struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	Name        string    `gorm:"size:50;not null;unique" json:"name"`
	Slug        string    `gorm:"uniqueIndex;size:50" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
