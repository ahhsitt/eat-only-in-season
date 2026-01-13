package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse 错误响应结构
type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ErrorHandler 全局错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// 检查是否有错误
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			log.Printf("Error: %v", err.Err)

			// 返回错误响应
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Code:    "INTERNAL_ERROR",
				Message: "服务器内部错误，请稍后重试",
			})
		}
	}
}

// RespondError 返回错误响应的辅助函数
func RespondError(c *gin.Context, status int, code string, message string) {
	c.JSON(status, ErrorResponse{
		Code:    code,
		Message: message,
	})
}
