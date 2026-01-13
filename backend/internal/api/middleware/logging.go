// Package middleware provides HTTP middleware for the API
package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger returns a middleware that logs HTTP requests
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Get client IP
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		// Log format: [GIN] timestamp | status | latency | ip | method path
		log.Printf("[API] %3d | %13v | %15s | %-7s %s\n",
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)
	}
}
