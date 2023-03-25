package main

import (
	"encoding/json"
	"log"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"

	"linkcatalog-sls/shared"
)

var region string = os.Getenv("REGION")
var siteBucket string = os.Getenv("SITE_BUCKET")
var wg sync.WaitGroup

type Return struct {
	EditKey        string `json:"editKey"`
	PageId         string `json:"pageId"`
	Status         uint8  `json:"status"`
	EditExpireTime string `json:"editExpireTime"`
}

func LambdaHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var page shared.PageWithKeys
	json.Unmarshal([]byte(request.Body), &page)

	bodyJson := createPage(page)
	return events.APIGatewayProxyResponse{Body: bodyJson, StatusCode: 200, Headers: map[string]string{"Access-Control-Allow-Origin": "*"}}, nil
}

func createPage(page shared.PageWithKeys) string {
	pageId := shared.CreateRandString(8)
	page.PageId = pageId

	wg.Add(1)
	go func() {
		shared.InsertPageToBucket(page.Html, pageId)
		wg.Done()
	}()

	timeNow := time.Now()
	time := timeNow.Format("2006-01-02 15:04:05")
	page.Time = time

	editKey := shared.CreateRandString(32)
	page.EditKey = editKey

	editExpireTime := timeNow.AddDate(0, 0, 14).Format("2006-01-02 15:04:05")
	page.EditExpireTime = editExpireTime

	wg.Add(1)
	go insertPageToDB(page)

	ret := Return{}
	ret.Status = 1
	ret.PageId = pageId
	ret.EditKey = editKey
	ret.EditExpireTime = editExpireTime

	retB, _ := json.Marshal(ret)

	wg.Wait()
	return string(retB)
}

func insertPageToDB(page shared.PageWithKeys) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)
	if err != nil {
		log.Printf("%s", err)
	}

	svc := dynamodb.New(sess)

	item, err := dynamodbattribute.MarshalMap(page)
	if err != nil {
		log.Printf("%s", err)
	}

	dbInput := &dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String("Page"),
	}

	_, err = svc.PutItem(dbInput)
	if err != nil {
		log.Printf("%s", err.Error())
	}

	log.Printf("%v Table insert done", page.PageId)
	wg.Done()
}

func main() {
	lambda.Start(LambdaHandler)
}
