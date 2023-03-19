package shared

import (
	"log"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
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

func InsertPageToBucket(html string, pageId string) {
	region := os.Getenv("REGION")
	bucket := os.Getenv("SITE_BUCKET")

	uploader := s3manager.NewUploader(session.New(&aws.Config{
		Region: aws.String(region)}),
	)

	bytes := strings.NewReader(html)

	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(strings.Join([]string{"p/", pageId}, "")),
		Body:        bytes,
		ContentType: aws.String("text/html"),
	})
	if err != nil {
		log.Printf("Upload fail")
	}

	log.Printf("%v Page upload done", pageId)
}
