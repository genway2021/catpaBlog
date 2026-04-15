package v1

import (
	"strconv"

	"flec_blog/internal/dto"
	"flec_blog/internal/service"
	"flec_blog/pkg/response"

	"github.com/gin-gonic/gin"
)

// MenuHandler 菜单处理器
type MenuHandler struct {
	menuService *service.MenuService
}

// NewMenuHandler 创建菜单处理器
func NewMenuHandler(menuService *service.MenuService) *MenuHandler {
	return &MenuHandler{
		menuService: menuService,
	}
}

// Create 创建菜单
//
//		@Summary	创建菜单
//	 @Description	创建新的菜单项
//		@Tags		菜单管理
//		@Accept		json
//		@Produce	json
//		@Security	BearerAuth
//		@Param		request	body		dto.MenuCreateRequest	true	"菜单信息"
//		@Success	201		{object}	response.Response{data=dto.MenuResponse}
//		@Router		/admin/menus [post]
func (h *MenuHandler) Create(ctx *gin.Context) {
	var req dto.MenuCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ValidateFailed(ctx, err.Error())
		return
	}

	result, err := h.menuService.Create(&req)
	if err != nil {
		response.Failed(ctx, err.Error())
		return
	}

	response.Created(ctx, result)
}

// Update 更新菜单
//
//		@Summary	更新菜单
//	 @Description	更新菜单项信息
//		@Tags		菜单管理
//		@Accept		json
//		@Produce	json
//		@Security	BearerAuth
//		@Param		id		path		int						true	"菜单ID"
//		@Param		request	body		dto.MenuUpdateRequest	true	"菜单信息"
//		@Success	200		{object}	response.Response{data=dto.MenuResponse}
//		@Router		/admin/menus/{id} [put]
func (h *MenuHandler) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ValidateFailed(ctx, "无效的菜单ID")
		return
	}

	var req dto.MenuUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ValidateFailed(ctx, err.Error())
		return
	}

	result, err := h.menuService.Update(uint(id), &req)
	if err != nil {
		response.Failed(ctx, err.Error())
		return
	}

	response.Success(ctx, result)
}

// Delete 删除菜单
//
//		@Summary	删除菜单
//	 @Description	硬删除菜单项，不可恢复
//		@Tags		菜单管理
//		@Accept		json
//		@Produce	json
//		@Security	BearerAuth
//		@Param		id		path		int						true	"菜单ID"
//		@Param		request	body		dto.MenuDeleteRequest	false	"删除选项"
//		@Success	200		{object}	response.Response
//		@Router		/admin/menus/{id} [delete]
func (h *MenuHandler) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ValidateFailed(ctx, "无效的菜单ID")
		return
	}

	var req dto.MenuDeleteRequest
	// 尝试绑定请求体，如果没有请求体或绑定失败，使用空的请求对象
	_ = ctx.ShouldBindJSON(&req)

	if err := h.menuService.Delete(uint(id), &req); err != nil {
		response.Failed(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}

// Get 获取菜单详情
//
//		@Summary	获取菜单详情
//	 @Description	获取菜单项的详细信息
//		@Tags		菜单管理
//		@Accept		json
//		@Produce	json
//		@Security	BearerAuth
//		@Param		id	path		int	true	"菜单ID"
//		@Success	200	{object}	response.Response{data=dto.MenuResponse}
//		@Router		/admin/menus/{id} [get]
func (h *MenuHandler) Get(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ValidateFailed(ctx, "无效的菜单ID")
		return
	}

	result, err := h.menuService.Get(uint(id))
	if err != nil {
		response.Failed(ctx, err.Error())
		return
	}

	response.Success(ctx, result)
}

// List 获取菜单树
//
//		@Summary	获取菜单树
//	 @Description	按类型获取菜单树
//		@Tags		菜单管理
//		@Accept		json
//		@Produce	json
//		@Security	BearerAuth
//		@Param	type	query		string	false	"菜单类型: aggregate/navigation/footer"
//		@Success	200		{object}	response.Response{data=[]dto.MenuTreeNode}
//		@Router		/admin/menus [get]
func (h *MenuHandler) List(ctx *gin.Context) {
	var req dto.MenuTreeQueryRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ValidateFailed(ctx, err.Error())
		return
	}

	result, err := h.menuService.List(req.Type)
	if err != nil {
		response.Failed(ctx, err.Error())
		return
	}

	response.Success(ctx, result)
}

// ListForWeb 获取菜单树（前台）
//
//	@Summary	获取菜单树
//	@Tags		菜单
//	@Accept		json
//	@Produce	json
//	@Param	type	query		string	false	"菜单类型: aggregate/navigation/footer (不传则返回所有类型)"
//	@Success	200		{object}	response.Response{data=[]dto.MenuTreeNode}
//	@Router		/menus [get]
func (h *MenuHandler) ListForWeb(ctx *gin.Context) {
	menuType := ctx.Query("type")

	result, err := h.menuService.ListForWeb(menuType)
	if err != nil {
		response.Failed(ctx, err.Error())
		return
	}

	response.Success(ctx, result)
}
