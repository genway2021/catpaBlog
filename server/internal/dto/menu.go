package dto

// MenuCreateRequest 创建菜单请求
type MenuCreateRequest struct {
	Type      string `json:"type" binding:"required,oneof=aggregate navigation footer"` // 菜单类型
	ParentID  *uint  `json:"parent_id"`                                                 // 父菜单ID，NULL表示主菜单
	Title     string `json:"title" binding:"required,min=1,max=100"`                    // 菜单标题
	URL       string `json:"url" binding:"max=500"`                                     // 链接地址（主菜单可为空）
	Icon      string `json:"icon" binding:"max=500"`                                    // 图标
	Sort      int    `json:"sort" binding:"min=1,max=10"`                               // 排序，范围1-10
	IsEnabled bool   `json:"is_enabled"`                                                // 是否启用
}

// MenuUpdateRequest 更新菜单请求
type MenuUpdateRequest struct {
	Type      string `json:"type" binding:"required,oneof=aggregate navigation footer"` // 菜单类型
	ParentID  *uint  `json:"parent_id"`                                                 // 父菜单ID
	Title     string `json:"title" binding:"required,min=1,max=100"`                    // 菜单标题
	URL       string `json:"url" binding:"max=500"`                                     // 链接地址
	Icon      string `json:"icon" binding:"max=500"`                                    // 图标
	Sort      int    `json:"sort" binding:"min=1,max=10"`                               // 排序
	IsEnabled bool   `json:"is_enabled"`                                                // 是否启用
}

// MenuTreeQueryRequest 查询菜单树请求
type MenuTreeQueryRequest struct {
	Type string `form:"type"` // 菜单类型过滤: aggregate/navigation/footer
}

// MenuDeleteRequest 删除菜单请求
type MenuDeleteRequest struct {
	ChildrenAction string `json:"children_action" binding:"omitempty,oneof=delete upgrade"` // 子菜单处理方式：delete-删除子菜单，upgrade-升级为主菜单
}

// MenuResponse 菜单响应（用于单条数据）
type MenuResponse struct {
	ID        uint   `json:"id"`
	Type      string `json:"type"`
	ParentID  *uint  `json:"parent_id"`
	Title     string `json:"title"`
	URL       string `json:"url"`
	Icon      string `json:"icon"`
	Sort      int    `json:"sort"`
	IsEnabled bool   `json:"is_enabled"`
}

// MenuTreeNode 菜单树节点（用于前端展示）
type MenuTreeNode struct {
	ID        uint           `json:"id"`
	Type      string         `json:"type"`
	ParentID  *uint          `json:"parent_id"`
	Title     string         `json:"title"`
	URL       string         `json:"url"`
	Icon      string         `json:"icon"`
	Sort      int            `json:"sort"`
	IsEnabled bool           `json:"is_enabled"`
	Children  []MenuTreeNode `json:"children,omitempty"` // 子菜单列表
}
