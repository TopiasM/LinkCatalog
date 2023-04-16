package main

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/disintegration/imaging"

	"linkcatalog-sls/shared"
)

var region string = os.Getenv("REGION")
var bucket string = os.Getenv("BUCKET_NAME")
var wResolution string = os.Getenv("RESOLUTION_W")
var hResolution string = os.Getenv("RESOLUTION_H")

func handleRequest(ctx context.Context, e events.DynamoDBEvent) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)
	if err != nil {
		log.Printf("%s", err.Error())
	}

	for _, record := range e.Records {
		log.Printf("Processing request data for event ID %s, type %s.\n", record.EventID, record.EventName)

		for name, value := range record.Change.Keys {
			if value.DataType() == events.DataTypeString && name == "pageId" {
				createOgImage(getPage(value.String(), sess), sess)
			}
		}
	}
}

func createOgImage(page shared.Page, sess *session.Session) {
	s3svc := s3.New(sess)
	screenshots := make(map[int]image.Image)

	linksLen := len(page.Links)
	rangeTop := 4
	if linksLen < 4 {
		rangeTop = linksLen
	}

	dividor := 2
	imgWidth, _ := strconv.Atoi(wResolution)
	bgScreenshotWidth := imgWidth / dividor
	imgHeight, _ := strconv.Atoi(hResolution)
	bgScreenshotHeight := imgHeight / dividor

	// Get screenshots
	for idx, link := range page.Links[0:rangeTop] {
		fileName := link.Filename
		filePath := strings.Join([]string{"screenshots", fileName}, "/")
		result, err := s3svc.GetObject(&s3.GetObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(filePath),
		})
		if err != nil {
			log.Printf("%s", err)
		}
		body := result.Body
		screenshot, _, err := image.Decode(body)

		resizeWidth := bgScreenshotWidth
		if linksLen == 2 || (idx == 2 && linksLen == 3) {
			resizeWidth = imgWidth
		}
		screenshot = imaging.Resize(screenshot, resizeWidth, 0, imaging.Lanczos)
		if linksLen == 2 {
			screenshot = imaging.CropAnchor(screenshot, bgScreenshotWidth, imgHeight, imaging.Center)
		}
		screenshot = imaging.Blur(screenshot, 5)
		screenshots[idx] = screenshot
		if err != nil {
			log.Printf("%s", err)
		}
	}

	dst := imaging.New(imgWidth, imgHeight, color.NRGBA{0, 0, 0, 0})
	dst = imaging.Paste(dst, screenshots[0], image.Pt(0, 0))
	dst = imaging.Paste(dst, screenshots[1], image.Pt(bgScreenshotWidth, 0))
	if linksLen > 2 {
		dst = imaging.Paste(dst, screenshots[2], image.Pt(0, bgScreenshotHeight))
	}
	if linksLen > 3 {
		dst = imaging.Paste(dst, screenshots[3], image.Pt(bgScreenshotWidth, bgScreenshotHeight))
	}

	options := jpeg.Options{Quality: 90}
	var buf bytes.Buffer
	err := jpeg.Encode(&buf, dst, &options)
	if err != nil {
		log.Printf("%s", err)
	}
	b := buf.Bytes()
	uploader := s3manager.NewUploader(sess)
	imgPath := strings.Join([]string{"og-images/", page.PageId, ".jpg"}, "")
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(imgPath),
		Body:   bytes.NewReader(b),
		ACL:    aws.String("public-read"),
	})
	if err != nil {
		log.Printf("d %s", err)
	}
}

func getPage(pageId string, sess *session.Session) shared.Page {
	svc := dynamodb.New(sess)

	result, err := svc.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("Page"),
		Key: map[string]*dynamodb.AttributeValue{
			"pageId": {
				S: aws.String(pageId),
			},
		},
	})
	if err != nil {
		log.Printf("%s", err.Error())
	}

	page := shared.Page{}

	err = dynamodbattribute.UnmarshalMap(result.Item, &page)
	if err != nil {
		panic(fmt.Sprintf("Failed to unmarshal Record, %v", err))
	}

	return page
}

func main() {
	lambda.Start(handleRequest)
}
