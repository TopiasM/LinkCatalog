package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"

	"encoding/json"
	"log"
	"os"

	"linkcatalog-sls/shared"
)

var region string = os.Getenv("REGION")

func LambdaHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var pageId = request.QueryStringParameters["pageId"]
	var editKey = request.QueryStringParameters["editKey"]

	json := fetchData(pageId, editKey)
	return events.APIGatewayProxyResponse{Body: json, StatusCode: 200, Headers: map[string]string{"Access-Control-Allow-Origin": "*"}}, nil
}

func fetchData(pageId, editKey string) string {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)
	if err != nil {
		log.Printf("%s", err)
	}

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
		log.Println(err.Error())
	}

	var ret []byte

	page := shared.PageWithKeys{}

	err = dynamodbattribute.UnmarshalMap(result.Item, &page)
	if err != nil {
		panic(fmt.Sprintf("Failed to unmarshal Record, %v", err))
	}

	editable := (editKey == page.EditKey)

	if editable {
		editConfirmationKey := shared.CreateRandString(32)
		page.EditConfirmationKey = editConfirmationKey
		newEditKey := shared.CreateRandString(32)
		page.EditKey = newEditKey

		timeNow := time.Now()

		dbInput := &dynamodb.UpdateItemInput{
			ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
				":eck": {
					S: aws.String(editConfirmationKey),
				},
				":ek": {
					S: aws.String(newEditKey),
				},
				":now": {
					S: aws.String(timeNow.Format("2006-01-02 15:04:05")),
				},
				":eet": {
					S: aws.String(timeNow.AddDate(0, 0, 14).Format("2006-01-02 15:04:05")),
				},
			},
			TableName: aws.String("Page"),
			Key: map[string]*dynamodb.AttributeValue{
				"pageId": {
					S: aws.String(pageId),
				},
			},
			ConditionExpression: aws.String("editExpireTime > :now"),
			UpdateExpression:    aws.String("set editConfirmationKey = :eck, updated = :now, editKey = :ek, editExpireTime = :eet"),
		}

		_, err = svc.UpdateItem(dbInput)
		if err != nil {
			log.Printf("%s", err)
			if strings.Contains(err.Error(), "ConditionalCheckFailedException") {
				return `{ "status": 0, "error": "EditKey expired" }`
			}
		}

		ret, err = json.Marshal(page)
		if err != nil {
			log.Printf("%s", err)
		}
	} else {
		var pageWithoutKeys shared.Page
		err = dynamodbattribute.UnmarshalMap(result.Item, &pageWithoutKeys)
		ret, err = json.Marshal(pageWithoutKeys)
		if err != nil {
			log.Printf("%s", err)
		}
	}

	return string(ret)
}

func main() {
	lambda.Start(LambdaHandler)
}
