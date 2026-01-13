// Package season provides season calculation based on location and date
package season

import (
	"time"

	"github.com/eat-only-in-season/backend/internal/models"
)

// SeasonNames maps season IDs to Chinese names
var SeasonNames = map[models.SeasonID]string{
	models.SeasonSpring: "春季",
	models.SeasonSummer: "夏季",
	models.SeasonAutumn: "秋季",
	models.SeasonWinter: "冬季",
}

// Calculator calculates the current season based on location
type Calculator struct{}

// NewCalculator creates a new season calculator
func NewCalculator() *Calculator {
	return &Calculator{}
}

// GetSeason calculates the current season for a given latitude
// Uses astronomical season definitions:
// - Spring: March 20 - June 20
// - Summer: June 21 - September 21
// - Autumn: September 22 - December 20
// - Winter: December 21 - March 19
// Southern hemisphere seasons are inverted
func (c *Calculator) GetSeason(latitude float64, date time.Time) models.Season {
	hemisphere := models.HemisphereNorth
	if latitude < 0 {
		hemisphere = models.HemisphereSouth
	}

	// Get the base season for northern hemisphere
	seasonID := c.getBaseSeason(date)

	// Invert for southern hemisphere
	if hemisphere == models.HemisphereSouth {
		seasonID = c.invertSeason(seasonID)
	}

	return models.Season{
		ID:         seasonID,
		Name:       SeasonNames[seasonID],
		Hemisphere: hemisphere,
	}
}

// getBaseSeason determines season based on date (northern hemisphere)
func (c *Calculator) getBaseSeason(date time.Time) models.SeasonID {
	month := date.Month()
	day := date.Day()

	switch month {
	case time.March:
		if day >= 20 {
			return models.SeasonSpring
		}
		return models.SeasonWinter
	case time.April, time.May:
		return models.SeasonSpring
	case time.June:
		if day >= 21 {
			return models.SeasonSummer
		}
		return models.SeasonSpring
	case time.July, time.August:
		return models.SeasonSummer
	case time.September:
		if day >= 22 {
			return models.SeasonAutumn
		}
		return models.SeasonSummer
	case time.October, time.November:
		return models.SeasonAutumn
	case time.December:
		if day >= 21 {
			return models.SeasonWinter
		}
		return models.SeasonAutumn
	case time.January, time.February:
		return models.SeasonWinter
	default:
		return models.SeasonSpring
	}
}

// invertSeason returns the opposite season for southern hemisphere
func (c *Calculator) invertSeason(season models.SeasonID) models.SeasonID {
	switch season {
	case models.SeasonSpring:
		return models.SeasonAutumn
	case models.SeasonSummer:
		return models.SeasonWinter
	case models.SeasonAutumn:
		return models.SeasonSpring
	case models.SeasonWinter:
		return models.SeasonSummer
	default:
		return season
	}
}

// GetCurrentSeason gets the season for current date and given latitude
func (c *Calculator) GetCurrentSeason(latitude float64) models.Season {
	return c.GetSeason(latitude, time.Now())
}
