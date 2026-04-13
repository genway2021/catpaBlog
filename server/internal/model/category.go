package model

import (
	"time"
)

// Category 分类模型
type Category struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	Name        string    `gorm:"size:50;not null;unique" json:"name"`
	Slug        string    `gorm:"uniqueIndex;size:50" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Sort        int       `gorm:"default:0" json:"sort"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
