package response

import (
	"net/http"

	"flec_blog/pkg/errcode"

	"github.com/gin-gonic/gin"
)

// Response 统一响应格式
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// PageResult 分页结果
type PageResult struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}, message ...string) {
	msg := "ok"
	if len(message) > 0 {
		msg = message[0]
	}
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: msg,
		Data:    data,
	})
}

// PageSuccess 分页成功响应
func PageSuccess(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "ok",
		Data: PageResult{
			List:     list,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		},
	})
}

// Created 创建成功响应
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Code:    0,
		Message: "ok",
		Data:    data,
	})
}

// Failed 失败响应
func Failed(c *gin.Context, message string) {
	c.JSON(http.StatusOK, Response{
		Code:    500,
		Message: message,
	})
}

// Error 错误响应
func Error(c *gin.Context, err *errcode.Error) {
	httpStatus := getHTTPStatus(err.GetCode())
	c.JSON(httpStatus, Response{
		Code:    err.GetCode(),
		Message: err.GetMsg(),
	})
}

// getHTTPStatus 根据业务错误码获取对应的HTTP状态码
func getHTTPStatus(code int) int {
	switch code {
	case 0:
		return http.StatusOK // 200
	case 10001: // InvalidParams
		return http.StatusBadRequest // 400
	case 10003: // Unauthorized
		return http.StatusUnauthorized // 401
	case 20004: // TokenError (包含 Token错误或已过期)
		return http.StatusUnauthorized // 401
	case 40001, 40006: // FileUploadError, FileProcessError
		return http.StatusBadRequest // 400
	case 40003: // FileNotFound
		return http.StatusNotFound // 404
	case 429: // 动态创建的限流错误
		return http.StatusTooManyRequests // 429
	default:
		return http.StatusInternalServerError // 500
	}
}

// ValidateFailed 参数验证失败
func ValidateFailed(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Code:    400,
		Message: message,
	})
}

// Unauthorized 未授权响应
func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, Response{
		Code:    401,
		Message: message,
	})
}

// NotFound 资源不存在响应
func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, Response{
		Code:    404,
		Message: message,
	})
}
