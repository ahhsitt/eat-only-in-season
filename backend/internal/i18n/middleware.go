// Package i18n provides internationalization middleware for Gin.
package i18n

import (
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	// LangHeader is the HTTP header for language preference
	LangHeader = "Accept-Language"
	// LangQuery is the query parameter for language override
	LangQuery = "lang"
	// LangContextKey is the Gin context key for storing language
	LangContextKey = "lang"
)

// Middleware returns a Gin middleware that detects and sets the user's language preference.
// Priority: 1. ?lang= query parameter, 2. Accept-Language header, 3. default language
func Middleware(defaultLang string) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := detectLanguage(c, defaultLang)
		c.Set(LangContextKey, lang)
		c.Next()
	}
}

// detectLanguage determines the language from request
func detectLanguage(c *gin.Context, defaultLang string) string {
	// Priority 1: Query parameter override
	if lang := c.Query(LangQuery); lang != "" {
		if IsSupported(lang) {
			return lang
		}
	}

	// Priority 2: Accept-Language header
	if acceptLang := c.GetHeader(LangHeader); acceptLang != "" {
		lang := parseAcceptLanguage(acceptLang)
		if IsSupported(lang) {
			return lang
		}
	}

	// Priority 3: Default language
	return defaultLang
}

// parseAcceptLanguage parses the Accept-Language header and returns the primary language
func parseAcceptLanguage(header string) string {
	// Handle formats like: "zh-CN,zh;q=0.9,en;q=0.8" or "en-US,en;q=0.9"
	parts := strings.Split(header, ",")
	if len(parts) == 0 {
		return ""
	}

	// Get the first (highest priority) language
	primary := strings.TrimSpace(parts[0])

	// Remove quality value if present
	if idx := strings.Index(primary, ";"); idx > 0 {
		primary = primary[:idx]
	}

	// Extract base language code (e.g., "zh" from "zh-CN")
	if idx := strings.Index(primary, "-"); idx > 0 {
		primary = primary[:idx]
	}

	return strings.ToLower(primary)
}

// GetLang retrieves the language from Gin context
func GetLang(c *gin.Context) string {
	if lang, exists := c.Get(LangContextKey); exists {
		if l, ok := lang.(string); ok {
			return l
		}
	}
	return DefaultLang()
}
