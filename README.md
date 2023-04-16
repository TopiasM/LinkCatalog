# LinkCatalog
> Live demo: [linkcatalog.fyi](https://linkcatalog.fyi)

Serverless website project that utilizes Serverless Framework, AWS, Golang, and Preact.

### Backend
- `serverless.yml` is used to define the AWS services(s3, DynamoDB, Lambda). <sup>(For the Live Demo I did Route53 and Cloudfront configuration in the control panel, so these are not included in the yml file)
- Lambda functions in the `Functions` folder
  - `Page create/load/update` RESP API functions for CRUD operations 
  - `Screenshot` REST API function that uses Headless Chrome to take a screenshot of a page, and then saves it to an s3 bucket
  - `Create Og Image` creates an og-image when a page is added to the DynamoDB table

### Frontend
`web` folder contains the Preact frontend that Serverless Framework serves to an s3 bucket on deployment. `page-create` and `page-update` API calls create a new static page in the s3 bucket.
