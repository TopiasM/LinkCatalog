package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"

	"linkcatalog-sls/shared"
)

var region string = os.Getenv("REGION")

func handleRequest(ctx context.Context, e events.DynamoDBEvent) {
	for _, record := range e.Records {
		log.Printf("Processing request data for event ID %s, type %s.\n", record.EventID, record.EventName)

		for name, value := range record.Change.Keys {
			if value.DataType() == events.DataTypeString && name == "pageId" {
				createOgImage(value.String())
			}
		}
	}
}

func createOgImage(pageId string) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)
	if err != nil {
		log.Printf("%s", err.Error())
	}

	log.Printf("%s", pageId)

	svc := dynamodb.New(sess)

	result, err := svc.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("Page"),
		Key: map[string]*dynamodb.AttributeValue{
			"pageId": {
				S: aws.String(pageId),
			},
		},
	})

	page := shared.Page{}

	err = dynamodbattribute.UnmarshalMap(result.Item, &page)
	if err != nil {
		panic(fmt.Sprintf("Failed to unmarshal Record, %v", err))
	}

	log.Println(len(page.Links))

	/*svc := s3.New(sess);
	imgs := make(map[int]image.Image)
	for i, fileName := range screenshots {
		key := strings.Join([]string{"public/screenshots/", fileName}, "")
		result, err := svc.GetObject(&s3.GetObjectInput {
		  Bucket: aws.String(bucketName),
		  Key: aws.String(key),
		})
		if(err != nil) {
		  log.Printf("%s", err)
		}
		body := result.Body
	  img, _, err := image.Decode(body)
		img = imaging.Resize(img, 640, 0, imaging.Lanczos)
		img = imaging.Blur(img, 5)
	  imgs[i] = img
		if(err != nil) {
		  log.Printf("%s", err)
		}
	}
	dst := imaging.New(1280, 720, color.NRGBA{255,255,255,0})
	dst = imaging.Paste(dst, imgs[0], image.Pt(0,0))
	dst = imaging.Paste(dst, imgs[1], image.Pt(640,0))
	if(len(imgs) == 3) {
	  dst = imaging.Paste(dst, imgs[2], image.Pt(320,360))
	} else {
	  dst = imaging.Paste(dst, imgs[2], image.Pt(0,360))
	}
	if(len(imgs) > 3) {
		dst = imaging.Paste(dst, imgs[3], image.Pt(640,360))
	}
	options := jpeg.Options{Quality: 90}
	var buf bytes.Buffer
	err = jpeg.Encode(&buf, dst, &options)
	if(err != nil) {
	  log.Printf("%s", err)
	}
	b := buf.Bytes()
	uploader := s3manager.NewUploader(sess)
	imgKey := strings.Join([]string{"public/share/", userId, "_", pageId, ".jpg"}, "")
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucketName),
		Key: aws.String(imgKey),
		Body: bytes.NewReader(b),
	  ACL: aws.String("public-read"),
	})
	if(err != nil) {
		log.Printf("d %s", err)
	}*/
}

func main() {
	lambda.Start(handleRequest)
}
