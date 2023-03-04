package shared

import (
	"math/rand"
	"time"
)

type Link struct {
	Url         string `json:"url"`
	Filename    string `json:"filename"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Page struct {
	PageId          string `json:"pageId"`
	Title           string `json:"title"`
	MainDescription string `json:"mainDescription"`
	Links           []Link `json:"links"`
	Time            string `json:"time"`
	Html            string `json:"html"`
}

type PageWithKeys struct {
	*Page
	EditKey             string `json:"editKey"`
	EditExpireTime      string `json:"editExpireTime"`
	EditConfirmationKey string `json:"editConfirmationKey"`
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func CreateRandString(length uint8) string {
	var seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}
