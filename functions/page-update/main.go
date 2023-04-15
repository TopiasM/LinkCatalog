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

type Return struct {
	Status uint8 `json:"status"`
}

var region string = os.Getenv("REGION")
var wg sync.WaitGroup

const tableName string = "Page"

func LambdaHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var page shared.PageWithKeys
	json.Unmarshal([]byte(request.Body), &page)
	status := updatePage(page)

	ret := Return{Status: status}
	retB, _ := json.Marshal(ret)
	return events.APIGatewayProxyResponse{Body: string(retB), StatusCode: 200, Headers: map[string]string{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}}, nil
}

func updatePage(page shared.PageWithKeys) uint8 {
	wg.Add(1)
	go func() {
		shared.InsertPageToBucket(page.Html, page.PageId)
		wg.Done()
	}()

	wg.Add(1)
	c := make(chan uint8)
	go updatePageInDb(page, c)

	result := <-c
	wg.Wait()
	return result
}

func updatePageInDb(page shared.PageWithKeys, cOut chan<- uint8) {
	sess, err := session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
		Config: aws.Config{
			Region: aws.String(region),
		},
	})
	if err != nil {
		log.Printf("%s", err)
	}

	svc := dynamodb.New(sess)

	links, err := dynamodbattribute.MarshalList(page.Links)
	dbInput := &dynamodb.UpdateItemInput{
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":t": {
				S: aws.String(page.Title),
			},
			":md": {
				S: aws.String(page.MainDescription),
			},
			":l": {
				L: links,
			},
			":eck": {
				S: aws.String(page.EditConfirmationKey),
			},
			":now": {
				S: aws.String(time.Now().Format("2006-01-02 15:04:05")),
			},
			":empty": {
				S: aws.String(""),
			},
			":zero": {
				N: aws.String("0"),
			},
		},
		TableName:           aws.String(tableName),
		ConditionExpression: aws.String("editConfirmationKey = :eck AND size(editConfirmationKey) > :zero"),
		Key: map[string]*dynamodb.AttributeValue{
			"pageId": {
				S: aws.String(page.PageId),
			},
		},
		UpdateExpression: aws.String(`set title = :t, mainDescription = :md, links = :l,
										updated = :now, editConfirmationKey = :empty`),
	}

	var result uint8 = 1
	_, err = svc.UpdateItem(dbInput)
	if err != nil {
		result = 0
		log.Printf("%s", err)
	}
	cOut <- result
	wg.Done()
}

func main() {
	lambda.Start(LambdaHandler)
}
