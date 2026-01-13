// Package pdf provides PDF generation service using gopdf
package pdf

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/eat-only-in-season/backend/internal/models"
	"github.com/signintech/gopdf"
)

// Service provides PDF generation functionality
type Service struct {
	fontPath string
}

// NewService creates a new PDF service
func NewService() *Service {
	return &Service{
		fontPath: "", // Will use embedded font or default
	}
}

// GenerateRecipePDF generates a PDF for a recipe with its details
func (s *Service) GenerateRecipePDF(recipe *models.Recipe, detail *models.RecipeDetail, includeImage bool) (string, string, error) {
	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})

	// Add font - try multiple Chinese font paths
	fontPaths := []string{
		"/Library/Fonts/Arial Unicode.ttf",                           // macOS Arial Unicode
		"/System/Library/Fonts/Supplemental/Arial Unicode.ttf",       // macOS Supplemental
		"/System/Library/Fonts/STHeiti Light.ttc",                    // macOS STHeiti
		"/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",     // Linux Noto
		"/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",     // Linux Noto OpenType
		"/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",               // Linux WenQuanYi
	}

	var fontLoaded bool
	for _, fontPath := range fontPaths {
		if err := pdf.AddTTFFont("default", fontPath); err == nil {
			fontLoaded = true
			break
		}
	}

	if !fontLoaded {
		return "", "", fmt.Errorf("无法加载中文字体，请确保系统已安装中文字体")
	}

	pdf.AddPage()

	// Set font
	err := pdf.SetFont("default", "", 24)
	if err != nil {
		return "", "", err
	}

	// Title
	y := 40.0
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, recipe.Name)

	// Description
	y += 40
	err = pdf.SetFont("default", "", 12)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, recipe.Description)

	// Meta info
	y += 30
	pdf.SetX(40)
	pdf.SetY(y)
	metaInfo := fmt.Sprintf("菜系: %s | 难度: %s | 时间: %d分钟",
		recipe.Cuisine,
		difficultyToString(recipe.Difficulty),
		recipe.CookingTime,
	)
	pdf.Cell(nil, metaInfo)

	// Image (if available and requested)
	if includeImage && recipe.ImageBase64 != "" {
		y += 30
		imageData, err := base64.StdEncoding.DecodeString(recipe.ImageBase64)
		if err == nil {
			imgHolder, err := gopdf.ImageHolderByBytes(imageData)
			if err == nil {
				pdf.ImageByHolder(imgHolder, 40, y, &gopdf.Rect{W: 250, H: 200})
				y += 220
			}
		}
	}

	// Seasonal ingredients
	y += 30
	err = pdf.SetFont("default", "", 14)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, "应季食材")

	y += 25
	err = pdf.SetFont("default", "", 12)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, strings.Join(recipe.SeasonalIngredients, "、"))

	// Ingredients section
	y += 40
	err = pdf.SetFont("default", "", 16)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, "食材清单")

	y += 25
	err = pdf.SetFont("default", "", 12)
	if err != nil {
		return "", "", err
	}

	for _, ing := range detail.Ingredients {
		if y > 780 {
			pdf.AddPage()
			y = 40
		}
		pdf.SetX(40)
		pdf.SetY(y)
		seasonal := ""
		if ing.IsSeasonal {
			seasonal = " (应季)"
		}
		pdf.Cell(nil, fmt.Sprintf("• %s: %.0f%s%s", ing.Name, ing.Amount, ing.Unit, seasonal))
		y += 20
	}

	// Steps section
	y += 30
	if y > 700 {
		pdf.AddPage()
		y = 40
	}
	err = pdf.SetFont("default", "", 16)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, "烹饪步骤")

	y += 25
	err = pdf.SetFont("default", "", 12)
	if err != nil {
		return "", "", err
	}

	for _, step := range detail.Steps {
		if y > 750 {
			pdf.AddPage()
			y = 40
		}
		pdf.SetX(40)
		pdf.SetY(y)
		stepText := fmt.Sprintf("%d. %s", step.Order, step.Instruction)
		pdf.Cell(nil, stepText)
		y += 20

		if step.Duration > 0 {
			pdf.SetX(50)
			pdf.SetY(y)
			pdf.Cell(nil, fmt.Sprintf("   约 %d 分钟", step.Duration))
			y += 20
		}

		if step.Tip != "" {
			pdf.SetX(50)
			pdf.SetY(y)
			pdf.Cell(nil, fmt.Sprintf("   提示: %s", step.Tip))
			y += 20
		}
		y += 5
	}

	// Tips section
	if len(detail.Tips) > 0 {
		y += 30
		if y > 700 {
			pdf.AddPage()
			y = 40
		}
		err = pdf.SetFont("default", "", 16)
		if err != nil {
			return "", "", err
		}
		pdf.SetX(40)
		pdf.SetY(y)
		pdf.Cell(nil, "烹饪小贴士")

		y += 25
		err = pdf.SetFont("default", "", 12)
		if err != nil {
			return "", "", err
		}

		for _, tip := range detail.Tips {
			if y > 780 {
				pdf.AddPage()
				y = 40
			}
			pdf.SetX(40)
			pdf.SetY(y)
			pdf.Cell(nil, fmt.Sprintf("• %s", tip))
			y += 20
		}
	}

	// Footer
	y += 30
	err = pdf.SetFont("default", "", 10)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(40)
	pdf.SetY(y)
	pdf.Cell(nil, "由「不时不食」AI应季食谱推荐生成")

	// Write to buffer
	var buf bytes.Buffer
	_, err = pdf.WriteTo(&buf)
	if err != nil {
		return "", "", fmt.Errorf("生成 PDF 失败: %w", err)
	}

	// Convert to base64
	pdfBase64 := base64.StdEncoding.EncodeToString(buf.Bytes())

	// Generate filename
	fileName := fmt.Sprintf("%s_菜谱.pdf", recipe.Name)

	return pdfBase64, fileName, nil
}

// difficultyToString converts difficulty to Chinese string
func difficultyToString(d models.Difficulty) string {
	switch d {
	case models.DifficultyEasy:
		return "简单"
	case models.DifficultyMedium:
		return "中等"
	case models.DifficultyHard:
		return "困难"
	default:
		return "未知"
	}
}

// GenerateNewRecipePDF generates a PDF for a new flow recipe detail
func (s *Service) GenerateNewRecipePDF(detail *models.NewRecipeDetail, imageData []byte) (string, string, error) {
	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})

	// A4 page dimensions: 595.28 x 841.89 points
	pageWidth := 595.28
	marginLeft := 50.0
	marginRight := 50.0
	contentWidth := pageWidth - marginLeft - marginRight

	// Add font - try multiple Chinese font paths
	fontPaths := []string{
		"/Library/Fonts/Arial Unicode.ttf",
		"/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
		"/System/Library/Fonts/STHeiti Light.ttc",
		"/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
		"/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
		"/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
	}

	var fontLoaded bool
	for _, fontPath := range fontPaths {
		if err := pdf.AddTTFFont("default", fontPath); err == nil {
			fontLoaded = true
			break
		}
	}

	if !fontLoaded {
		return "", "", fmt.Errorf("无法加载中文字体，请确保系统已安装中文字体")
	}

	pdf.AddPage()
	y := 40.0

	// === Header with decorative line ===
	pdf.SetLineWidth(2)
	pdf.SetStrokeColor(139, 154, 125) // #8B9A7D green
	pdf.Line(marginLeft, y, pageWidth-marginRight, y)
	y += 15

	// Title
	err := pdf.SetFont("default", "", 28)
	if err != nil {
		return "", "", err
	}
	pdf.SetX(marginLeft)
	pdf.SetY(y)
	pdf.Cell(nil, detail.Title)
	y += 40

	// Subtitle line
	pdf.SetLineWidth(0.5)
	pdf.Line(marginLeft, y, pageWidth-marginRight, y)
	y += 20

	// === Image (if available) ===
	if len(imageData) > 0 {
		imgHolder, err := gopdf.ImageHolderByBytes(imageData)
		if err == nil {
			// Center the image, max width 400, max height 250
			imgWidth := 400.0
			imgHeight := 250.0
			imgX := marginLeft + (contentWidth-imgWidth)/2
			pdf.ImageByHolder(imgHolder, imgX, y, &gopdf.Rect{W: imgWidth, H: imgHeight})
			y += imgHeight + 20
		}
	}

	// === Meta info box ===
	err = pdf.SetFont("default", "", 11)
	if err != nil {
		return "", "", err
	}

	// Draw meta info in a styled box
	boxY := y
	pdf.SetFillColor(245, 240, 235) // Light beige #F5F0EB
	pdf.RectFromUpperLeftWithStyle(marginLeft, boxY, contentWidth, 50, "F")

	pdf.SetTextColor(102, 102, 102) // #666666
	y = boxY + 18
	pdf.SetX(marginLeft + 15)
	pdf.SetY(y)
	metaInfo := fmt.Sprintf("难度: %s    |    烹饪时间: %s    |    份量: %s",
		detail.Difficulty, detail.CookingTime, detail.Servings)
	pdf.Cell(nil, metaInfo)

	if len(detail.Tags) > 0 {
		y += 18
		pdf.SetX(marginLeft + 15)
		pdf.SetY(y)
		pdf.Cell(nil, "标签: "+strings.Join(detail.Tags, " · "))
	}
	y = boxY + 60

	// === Description ===
	pdf.SetTextColor(45, 45, 45) // #2D2D2D
	err = pdf.SetFont("default", "", 12)
	if err != nil {
		return "", "", err
	}
	y += 10
	pdf.SetX(marginLeft)
	pdf.SetY(y)

	// Word wrap description
	descLines := wrapText(detail.Description, 70) // ~70 chars per line
	for _, line := range descLines {
		if y > 780 {
			pdf.AddPage()
			y = 40
		}
		pdf.SetX(marginLeft)
		pdf.SetY(y)
		pdf.Cell(nil, line)
		y += 18
	}
	y += 15

	// === Section: Ingredients ===
	y = drawSectionHeader(&pdf, marginLeft, y, pageWidth-marginRight, "[材料] 食材清单")

	err = pdf.SetFont("default", "", 11)
	if err != nil {
		return "", "", err
	}
	pdf.SetTextColor(45, 45, 45)

	// Two-column layout for ingredients
	colWidth := contentWidth / 2
	leftX := marginLeft
	rightX := marginLeft + colWidth
	leftY := y
	rightY := y

	for i, ing := range detail.Ingredients {
		text := fmt.Sprintf("• %s  %s", ing.Name, ing.Amount)
		if ing.Note != "" {
			text += fmt.Sprintf(" (%s)", ing.Note)
		}

		var currentX float64
		var currentY *float64
		if i%2 == 0 {
			currentX = leftX
			currentY = &leftY
		} else {
			currentX = rightX
			currentY = &rightY
		}

		if *currentY > 750 {
			pdf.AddPage()
			leftY = 40
			rightY = 40
			*currentY = 40
		}

		pdf.SetX(currentX)
		pdf.SetY(*currentY)
		pdf.Cell(nil, text)
		*currentY += 22
	}

	y = leftY
	if rightY > y {
		y = rightY
	}
	y += 20

	// === Section: Steps ===
	if y > 700 {
		pdf.AddPage()
		y = 40
	}
	y = drawSectionHeader(&pdf, marginLeft, y, pageWidth-marginRight, "[CHEF] 烹饪步骤")

	err = pdf.SetFont("default", "", 11)
	if err != nil {
		return "", "", err
	}

	for _, step := range detail.Steps {
		if y > 720 {
			pdf.AddPage()
			y = 40
		}

		// Step number circle
		pdf.SetFillColor(139, 154, 125) // Green
		circleX := marginLeft + 12
		circleY := y + 8
		pdf.Oval(circleX-10, circleY-10, 20, 20)

		// Step number text (white)
		pdf.SetTextColor(255, 255, 255)
		err = pdf.SetFont("default", "", 12)
		if err != nil {
			return "", "", err
		}
		pdf.SetX(circleX - 4)
		pdf.SetY(circleY - 6)
		pdf.Cell(nil, fmt.Sprintf("%d", step.StepNumber))

		// Step instruction
		pdf.SetTextColor(45, 45, 45)
		err = pdf.SetFont("default", "", 11)
		if err != nil {
			return "", "", err
		}

		stepLines := wrapText(step.Instruction, 60)
		stepX := marginLeft + 35
		stepY := y + 3
		for _, line := range stepLines {
			if stepY > 780 {
				pdf.AddPage()
				stepY = 40
			}
			pdf.SetX(stepX)
			pdf.SetY(stepY)
			pdf.Cell(nil, line)
			stepY += 16
		}

		if step.Duration != "" {
			pdf.SetTextColor(150, 150, 150)
			pdf.SetX(stepX)
			pdf.SetY(stepY)
			pdf.Cell(nil, "时长: "+step.Duration)
			stepY += 16
		}

		y = stepY + 10
	}

	// === Section: Tips ===
	if detail.Tips != "" {
		if y > 680 {
			pdf.AddPage()
			y = 40
		}
		y = drawSectionHeader(&pdf, marginLeft, y, pageWidth-marginRight, "[TIP] 烹饪小贴士")

		// Tips box
		pdf.SetFillColor(232, 237, 228) // Light green #E8EDE4
		tipLines := wrapText(detail.Tips, 70)
		boxHeight := float64(len(tipLines)*18 + 20)
		pdf.RectFromUpperLeftWithStyle(marginLeft, y, contentWidth, boxHeight, "F")

		err = pdf.SetFont("default", "", 11)
		if err != nil {
			return "", "", err
		}
		pdf.SetTextColor(107, 122, 93) // #6B7A5D

		tipY := y + 12
		for _, line := range tipLines {
			pdf.SetX(marginLeft + 15)
			pdf.SetY(tipY)
			pdf.Cell(nil, line)
			tipY += 18
		}
		y += boxHeight + 20
	}

	// === Footer ===
	if y > 780 {
		pdf.AddPage()
		y = 40
	}
	y += 20
	pdf.SetLineWidth(1)
	pdf.SetStrokeColor(139, 154, 125)
	pdf.Line(marginLeft, y, pageWidth-marginRight, y)
	y += 15

	err = pdf.SetFont("default", "", 9)
	if err != nil {
		return "", "", err
	}
	pdf.SetTextColor(150, 150, 150)
	pdf.SetX(marginLeft)
	pdf.SetY(y)
	pdf.Cell(nil, "由「不时不食」AI 应季食谱推荐生成  ·  eat-only-in-season.app")

	// Write to buffer
	var buf bytes.Buffer
	_, err = pdf.WriteTo(&buf)
	if err != nil {
		return "", "", fmt.Errorf("生成 PDF 失败: %w", err)
	}

	pdfBase64 := base64.StdEncoding.EncodeToString(buf.Bytes())
	fileName := fmt.Sprintf("%s_菜谱.pdf", detail.Title)

	return pdfBase64, fileName, nil
}

// drawSectionHeader draws a styled section header
func drawSectionHeader(pdf *gopdf.GoPdf, left, y, right float64, title string) float64 {
	pdf.SetFont("default", "", 16)
	pdf.SetTextColor(45, 45, 45)
	pdf.SetX(left)
	pdf.SetY(y)
	pdf.Cell(nil, title)
	y += 25

	pdf.SetLineWidth(0.5)
	pdf.SetStrokeColor(200, 200, 200)
	pdf.Line(left, y, right, y)
	y += 15

	return y
}

// wrapText wraps text to fit within a certain character width
func wrapText(text string, maxChars int) []string {
	if len(text) == 0 {
		return nil
	}

	var lines []string
	runes := []rune(text)

	for len(runes) > 0 {
		if len(runes) <= maxChars {
			lines = append(lines, string(runes))
			break
		}

		// Find a good break point
		breakPoint := maxChars
		for i := maxChars; i > maxChars/2; i-- {
			if runes[i] == ' ' || runes[i] == '，' || runes[i] == '。' || runes[i] == '、' || runes[i] == '；' {
				breakPoint = i + 1
				break
			}
		}

		lines = append(lines, string(runes[:breakPoint]))
		runes = runes[breakPoint:]
	}

	return lines
}
