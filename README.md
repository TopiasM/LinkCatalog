# LinkCatalog
> Live demo: [linkcatalog.fyi](https://linkcatalog.fyi)

**WIP** Serverless website project that utilizes Serverless Framework, AWS, Golang, and Preact

### Idea
A website that allows a user to create a shareable 'catalog' of links without signing up for the website. When the user creates a page or visits the edit page, a one-time URL is provided that allows the user to update the page in a 2 week period

### Backend
- `serverless.yml` is used to define the AWS services(s3, DynamoDB, Lambda). <sup>(For the Live Demo I did Route53 and Cloudfront configuration in the control panel, so these are not included in the yml file)
- Go Lambda functions in the `Functions` folder
  - `Page create/load/update` RESP API functions for CRUD operations 
  - `Screenshot` REST API function that uses Headless Chrome to take a screenshot of a page, and then saves it to an s3 bucket
  - `Og Image Create` trigger function creates an og-image when a page is added to the DynamoDB table

### Frontend
`web` folder contains the Preact frontend that Serverless Framework serves to an s3 bucket on deployment. `page-create` and `page-update` API calls create a new static page in the s3 bucket

 ### To-do
  - Home page
  - Website design improvements
  - Tests
  - User input validation
  - Security improvements
  - Features & Bug fixes
  - Clean the codebase
  - etc...
