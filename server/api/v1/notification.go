package v1

import (
	"flec_blog/internal/dto"
	"flec_blog/internal/service"
	"flec_blog/pkg/response"

	"github.com/gin-gonic/gin"
)

// NotificationController 通知控制器
type NotificationController struct {
	service *service.NotificationService
}

// NewNotificationController 创建通知控制器实例
func NewNotificationController(service *service.NotificationService) *NotificationController {
	return &NotificationController{
		service: service,
	}
}

// ============ 前台用户通知接口 ============

// ListForWeb 获取用户通知列表
//
//	@Summary		获取用户通知列表
//	@Description	获取当前用户的通知列表（评论回复、全站通知等），包含未读数量
//	@Tags			通知
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			page		query		int	true	"页码"
//	@Param			page_size	query		int	true	"每页数量"
//	@Success		200			{object}	response.Response{data=dto.NotificationListResponse}
//	@Failure		400			{object}	response.Response
//	@Failure		401			{object}	response.Response
//	@Router			/api/v1/notifications [get]
func (h *NotificationController) ListForWeb(c *gin.Context) {
	var req dto.NotificationListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ValidateFailed(c, err.Error())
		return
	}

	// 从上下文获取用户 ID
	userID := c.GetUint("user_id")

	result, err := h.service.ListForWeb(c.Request.Context(), userID, &req)
	if err != nil {
		response.Failed(c, err.Error())
		return
	}

	response.Success(c, result)
}

// MarkAsRead 标记通知为已读
//
//	@Summary		标记通知为已读
//	@Description	将指定通知标记为已读状态
//	@Tags			通知
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			id		path		int	true	"通知ID"
//	@Success		200		{object}	response.Response
//	@Failure		400		{object}	response.Response
//	@Failure		401		{object}	response.Response
//	@Router			/api/v1/notifications/{id}/read [put]
func (h *NotificationController) MarkAsRead(c *gin.Context) {
	var req dto.MarkAsReadRequest
	if err := c.ShouldBindUri(&req); err != nil {
		response.ValidateFailed(c, err.Error())
		return
	}

	// 从上下文获取用户 ID
	userID := c.GetUint("user_id")

	if err := h.service.MarkAsRead(c.Request.Context(), req.ID, userID); err != nil {
		response.Failed(c, err.Error())
		return
	}

	response.Success(c, nil)
}

// MarkAllAsRead 标记所有通知为已读
//
//	@Summary		标记所有通知为已读
//	@Description	将所有通知标记为已读状态
//	@Tags			通知
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	response.Response
//	@Failure		400	{object}	response.Response
//	@Failure		401	{object}	response.Response
//	@Router			/api/v1/notifications/read-all [put]
func (h *NotificationController) MarkAllAsRead(c *gin.Context) {
	// 从上下文获取用户 ID
	userID := c.GetUint("user_id")

	if err := h.service.MarkAllAsRead(c.Request.Context(), userID); err != nil {
		response.Failed(c, err.Error())
		return
	}

	response.Success(c, nil)
}

// ============ 后台管理通知接口 ============

// List 获取通知列表
//
//	@Summary		获取通知列表
//	@Description	获取管理员的通知列表（评论通知、问题反馈、友链申请、异常友链等），包含未读数量
//	@Tags			通知管理
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			page		query		int	true	"页码"
//	@Param			page_size	query		int	true	"每页数量"
//	@Success		200			{object}	response.Response{data=dto.NotificationListResponse}
//	@Failure		400			{object}	response.Response
//	@Failure		401			{object}	response.Response
//	@Router			/api/v1/admin/notifications [get]
func (h *NotificationController) List(c *gin.Context) {
	var req dto.NotificationListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ValidateFailed(c, err.Error())
		return
	}

	// 从上下文获取用户 ID
	userID := c.GetUint("user_id")

	result, err := h.service.List(c.Request.Context(), userID, &req)
	if err != nil {
		response.Failed(c, err.Error())
		return
	}

	response.Success(c, result)
}
