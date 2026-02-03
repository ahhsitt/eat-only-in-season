package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/eat-only-in-season/backend/internal/api"
	"github.com/eat-only-in-season/backend/internal/cache"
	"github.com/eat-only-in-season/backend/internal/i18n"
	"github.com/eat-only-in-season/backend/pkg/config"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 加载 .env 文件（如果存在）
	if err := godotenv.Load(); err != nil {
		log.Println("未找到 .env 文件，使用系统环境变量")
	}

	// 加载配置
	cfg := config.Load()

	// 初始化 i18n 模块
	localesDir := filepath.Join("locales")
	if err := i18n.Init(localesDir, "zh"); err != nil {
		log.Fatalf("初始化 i18n 模块失败: %v", err)
	}
	log.Printf("i18n 模块已初始化，支持语言: %v", i18n.SupportedLanguages())

	// 设置 Gin 模式
	if cfg.GinMode != "" {
		gin.SetMode(cfg.GinMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// 初始化双层缓存管理器
	if err := cache.InitDefaultManager(cfg.Cache); err != nil {
		log.Fatalf("初始化缓存管理器失败: %v", err)
	}
	log.Printf("缓存管理器已初始化: 内存TTL=%v, SQLiteTTL=%v, 路径=%s",
		cfg.Cache.MemoryTTL, cfg.Cache.SQLiteTTL, cfg.Cache.SQLitePath)

	// 创建上下文用于优雅关闭
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 启动缓存预热 (从SQLite加载到内存)
	if err := cache.DefaultManager.WarmUp(); err != nil {
		log.Printf("缓存预热警告: %v", err)
	}

	// 启动 SQLite 清理协程
	go cache.DefaultManager.StartCleanupRoutine(ctx)

	// 创建路由
	router := api.SetupRouter()

	// 设置优雅关闭
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh

		log.Println("收到关闭信号，正在关闭...")
		cancel()

		if err := cache.DefaultManager.Close(); err != nil {
			log.Printf("关闭缓存管理器失败: %v", err)
		}
		log.Println("缓存管理器已关闭")
		os.Exit(0)
	}()

	// 获取端口
	port := cfg.ServerPort
	if port == "" {
		port = "8080"
	}

	// 启动服务
	log.Printf("Starting server on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
