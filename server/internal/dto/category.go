package dto

// ============ 通用分类请求 ============

// ListCategoryRequest 分类列表请求
type ListCategoryRequest struct {
	Page     int `form:"page" binding:"omitempty,min=1"`
	PageSize int `form:"page_size" binding:"omitempty,min=1,max=1000"`
}

// ============ 通用分类响应 ============

// CategoryForWebResponse 分类响应
type CategoryForWebResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Count       int    `json:"count"`
	Sort        int    `json:"sort"`
}

// ============ 后台分类管理请求 ============

// CreateCategoryRequest 创建分类请求
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,max=50"`
	Description string `json:"description" binding:"max=200"`
	Sort        int    `json:"sort"`
}

// UpdateCategoryRequest 更新分类请求
type UpdateCategoryRequest struct {
	Name        string `json:"name" binding:"required,max=50"`
	Description string `json:"description" binding:"max=200"`
	Sort        int    `json:"sort"`
}

// CategoryResponse 分类响应
type CategoryResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Count       int    `json:"count"`
	Sort        int    `json:"sort"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}
