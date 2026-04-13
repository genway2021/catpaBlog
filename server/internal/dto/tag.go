package dto

// ============ 通用标签请求 ============

// ListTagRequest 标签列表请求
type ListTagRequest struct {
	Page     int `form:"page" binding:"omitempty,min=1"`
	PageSize int `form:"page_size" binding:"omitempty,min=1,max=1000"`
}

// ============ 通用标签响应 ============

// TagForWebResponse 标签响应
type TagForWebResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Count       int    `json:"count"`
}

// ============ 后台标签管理请求 ============

// CreateTagRequest 创建标签请求
type CreateTagRequest struct {
	Name        string `json:"name" binding:"required,max=50"`
	Description string `json:"description" binding:"max=200"`
}

// UpdateTagRequest 更新标签请求
type UpdateTagRequest struct {
	Name        string `json:"name" binding:"required,max=50"`
	Description string `json:"description" binding:"max=200"`
}

// TagResponse 标签响应
type TagResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Count       int    `json:"count"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}
