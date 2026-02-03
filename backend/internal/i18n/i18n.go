// Package i18n provides internationalization support for the application.
package i18n

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// Locale represents a loaded locale with translations
type Locale struct {
	Categories map[string]string `json:"categories"`
	Seasons    map[string]string `json:"seasons"`
	Difficulty map[string]string `json:"difficulty"`
	Prompts    map[string]string `json:"prompts"`
	Messages   map[string]string `json:"messages"`
}

// Manager manages loaded locales and provides translation functions
type Manager struct {
	locales     map[string]*Locale
	defaultLang string
	mu          sync.RWMutex
}

// contextKey is the context key for storing language
type contextKey string

const langContextKey contextKey = "lang"

var (
	globalManager *Manager
	once          sync.Once
)

// Init initializes the i18n manager with locale files from the given directory
func Init(localesDir string, defaultLang string) error {
	var initErr error
	once.Do(func() {
		globalManager = &Manager{
			locales:     make(map[string]*Locale),
			defaultLang: defaultLang,
		}
		initErr = globalManager.loadLocales(localesDir)
	})
	return initErr
}

// loadLocales loads all locale files from the directory
func (m *Manager) loadLocales(dir string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("failed to read locales directory: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		lang := strings.TrimSuffix(entry.Name(), ".json")
		filePath := filepath.Join(dir, entry.Name())

		data, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read locale file %s: %w", filePath, err)
		}

		var locale Locale
		if err := json.Unmarshal(data, &locale); err != nil {
			return fmt.Errorf("failed to parse locale file %s: %w", filePath, err)
		}

		m.mu.Lock()
		m.locales[lang] = &locale
		m.mu.Unlock()
	}

	if len(m.locales) == 0 {
		return fmt.Errorf("no locale files found in %s", dir)
	}

	return nil
}

// GetLocale returns the locale for the given language, falling back to default
func GetLocale(lang string) *Locale {
	if globalManager == nil {
		return nil
	}

	globalManager.mu.RLock()
	defer globalManager.mu.RUnlock()

	if locale, ok := globalManager.locales[lang]; ok {
		return locale
	}
	return globalManager.locales[globalManager.defaultLang]
}

// WithLang returns a new context with the language set
func WithLang(ctx context.Context, lang string) context.Context {
	return context.WithValue(ctx, langContextKey, lang)
}

// LangFromContext extracts the language from context
func LangFromContext(ctx context.Context) string {
	if lang, ok := ctx.Value(langContextKey).(string); ok {
		return lang
	}
	if globalManager != nil {
		return globalManager.defaultLang
	}
	return "zh"
}

// GetCategory returns the translated category name
func GetCategory(lang, code string) string {
	locale := GetLocale(lang)
	if locale == nil {
		return code
	}
	if name, ok := locale.Categories[code]; ok {
		return name
	}
	return code
}

// GetSeason returns the translated season name
func GetSeason(lang, code string) string {
	locale := GetLocale(lang)
	if locale == nil {
		return code
	}
	if name, ok := locale.Seasons[code]; ok {
		return name
	}
	return code
}

// GetDifficulty returns the translated difficulty name
func GetDifficulty(lang, code string) string {
	locale := GetLocale(lang)
	if locale == nil {
		return code
	}
	if name, ok := locale.Difficulty[code]; ok {
		return name
	}
	return code
}

// GetPrompt returns the prompt template for the given key
func GetPrompt(lang, key string) string {
	locale := GetLocale(lang)
	if locale == nil {
		return ""
	}
	return locale.Prompts[key]
}

// GetMessage returns the message for the given key
func GetMessage(lang, key string) string {
	locale := GetLocale(lang)
	if locale == nil {
		return key
	}
	if msg, ok := locale.Messages[key]; ok {
		return msg
	}
	return key
}

// SupportedLanguages returns a list of supported language codes
func SupportedLanguages() []string {
	if globalManager == nil {
		return nil
	}

	globalManager.mu.RLock()
	defer globalManager.mu.RUnlock()

	langs := make([]string, 0, len(globalManager.locales))
	for lang := range globalManager.locales {
		langs = append(langs, lang)
	}
	return langs
}

// IsSupported checks if a language is supported
func IsSupported(lang string) bool {
	if globalManager == nil {
		return false
	}

	globalManager.mu.RLock()
	defer globalManager.mu.RUnlock()

	_, ok := globalManager.locales[lang]
	return ok
}

// DefaultLang returns the default language
func DefaultLang() string {
	if globalManager != nil {
		return globalManager.defaultLang
	}
	return "zh"
}
