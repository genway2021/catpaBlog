package v1

import (
	"strconv"

	"flec_blog/internal/dto"
	"flec_blog/internal/service"
	"flec_blog/pkg/errcode"
	"flec_blog/pkg/response"

	"github.com/gin-gonic/gin"
)

// SubscriberHandler 订阅者处理器
type SubscriberHandler struct {
	service *service.SubscriberService
}

// NewSubscriberHandler 创建订阅者处理器
func NewSubscriberHandler(service *service.SubscriberService) *SubscriberHandler {
	return &SubscriberHandler{service: service}
}

// Subscribe 订阅
//
//		@Summary 	邮件订阅
//	 @Description 	用户通过提交邮箱地址订阅博客更新
//		@Tags		订阅
//		@Accept		json
//		@Produce	json
//		@Param		request	body		object{email=string}	true	"邮箱地址"
//		@Success	200		{object}	response.Response
//		@Router		/api/v1/subscribe [post]
func (h *SubscriberHandler) Subscribe(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidateFailed(c, "邮箱格式不正确")
		return
	}

	if err := h.service.Subscribe(c.Request.Context(), req.Email); err != nil {
		response.Failed(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "订阅成功！"})
}

// Unsubscribe 订阅退订
//
//		@Summary	订阅退订
//	 @Description	用户通过退订令牌退订邮件通知
//		@Tags		订阅
//		@Accept		json
//		@Produce	json
//		@Param		token	query		string	true	"退订令牌"
//		@Success	200		{object}	response.Response
//		@Router		/api/v1/subscribe/unsubscribe [get]
func (h *SubscriberHandler) Unsubscribe(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		response.ValidateFailed(c, "缺少token参数")
		return
	}

	if err := h.service.Unsubscribe(c.Request.Context(), token); err != nil {
		response.Failed(c, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "退订成功"})
}

// ============ 后台管理接口 ============

// List 获取订阅者列表
//
//	@Summary	获取订阅者列表
//	@Tags		订阅管理
//	@Accept		json
//	@Produce	json
//	@Security	BearerAuth
//	@Param		page		query		int	true	"页码"
//	@Param		page_size	query		int	true	"每页数量"
//	@Success	200			{object}	response.Response{data=response.PageResult{list=[]dto.SubscriberResponse}}
//	@Router		/api/v1/admin/subscribers [get]
func (h *SubscriberHandler) List(c *gin.Context) {
	var req dto.SubscriberQueryRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, errcode.InvalidParams.WithDetails(err.Error()))
		return
	}

	subscribers, total, err := h.service.List(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, errcode.ServerError.WithDetails(err.Error()))
		return
	}

	response.Success(c, response.PageResult{
		List:     subscribers,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	})
}

// Delete 删除订阅者
//
//	@Summary	删除订阅者
//	@Tags		订阅管理
//	@Accept		json
//	@Produce	json
//	@Security	BearerAuth
//	@Param		id	path		int	true	"订阅者ID"
//	@Success	200	{object}	response.Response
//	@Router		/api/v1/admin/subscribers/{id} [delete]
func (h *SubscriberHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, errcode.InvalidParams.WithDetails("无效的订阅者ID"))
		return
	}

	if err := h.service.Delete(c.Request.Context(), uint(id)); err != nil {
		response.Error(c, errcode.ServerError.WithDetails(err.Error()))
		return
	}

	response.Success(c, nil)
}
