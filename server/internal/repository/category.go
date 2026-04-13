package repository

import (
	"context"

	"flec_blog/internal/model"

	"gorm.io/gorm"
)

// CategoryRepository 分类仓储
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository 创建分类仓储
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// ============ 基础CRUD ============

// List 获取分类列表
func (r *CategoryRepository) List(ctx context.Context, page, pageSize int) ([]model.Category, int64, error) {
	var categories []model.Category
	var total int64

	err := r.db.WithContext(ctx).Model(&model.Category{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	query := r.db.WithContext(ctx).Order("sort DESC")

	// 分页处理
	if page > 0 && pageSize > 0 {
		offset := (page - 1) * pageSize
		query = query.Offset(offset).Limit(pageSize)
	}

	err = query.Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

// Get 获取分类
func (r *CategoryRepository) Get(ctx context.Context, id uint) (*model.Category, error) {
	var category model.Category
	err := r.db.WithContext(ctx).First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetBySlug 根据slug获取分类
func (r *CategoryRepository) GetBySlug(ctx context.Context, slug string) (*model.Category, error) {
	var category model.Category
	err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Create 创建分类
func (r *CategoryRepository) Create(ctx context.Context, category *model.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

// Update 更新分类
func (r *CategoryRepository) Update(ctx context.Context, category *model.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

// Delete 删除分类
func (r *CategoryRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Unscoped().Delete(&model.Category{}, id).Error
}
