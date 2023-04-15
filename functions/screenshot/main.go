package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"image"
	"image/jpeg"
	"log"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/disintegration/imaging"
	"github.com/mafredri/cdp"
	"github.com/mafredri/cdp/devtool"
	"github.com/mafredri/cdp/protocol/css"
	"github.com/mafredri/cdp/protocol/dom"
	"github.com/mafredri/cdp/protocol/page"
	"github.com/mafredri/cdp/rpcc"

	"linkcatalog-sls/shared"
)

type Ret struct {
	Status   int8   `json:"status"`
	Filename string `json:"filename"`
	Url      string `json:"url"`
	Title    string `json:"title"`
}

const hcPath string = "./functions/bin/headless_shell"

var bucketName string = os.Getenv("BUCKET_NAME")
var region string = os.Getenv("REGION")

const selectorsToHide = `#xe7COe, #cookie-disclosure, #cookie-consent, .axeptio_widget, #awsccc-cb-content,
.js-consent-banner,#cookie-notice, #cookie-law-info-bar, .cc-type-categories,
#bnp_container, #cl-consent, #cmplz-cookiebanner-container, #drupalorg-crosssite-gdpr, #gdpr-new-container,
#onetrust-consent-sdk, .a8c-cookie-banner, #cookie-consent-banner, #cookieBar, .evidon-banner,
#cmpbox, #cookie-banner, #onetrust-banner-sdk, .ytd-consent-bump-v2-lightbox, .uiLayer, .global-alert-banner, #gdpr-banner,
.consent-banner, .gdpr, #truste-consent-track, #sp-cc, #scrollview, .con-wizard, .cmpboxbtns,
#CybotCookiebotDialog, .aspXfg`

var fileName string = ""
var title string = ""
var addr string = ""
var status int8 = 0

const fileExt = ".jpg"

var wg sync.WaitGroup

// Init sets home env variable, so the jp / kr / cn fonts get loaded from the .fonts folder
// And runs headless chrome in coroutine and waits for it to start
func init() {
	if err := os.Setenv("HOME", "./functions/bin/"); err != nil {
		log.Printf("Setenv err: %s", err)
	}

	wg.Add(1)
	go runHeadless()
	wg.Wait()
}

func LambdaHandler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	addr = request.Body
	takeScreenshot()

	ret := Ret{}
	ret.Status = status
	var statusCode int
	if status == 1 {
		ret.Filename = fileName
		ret.Url = addr
		ret.Title = title
		statusCode = 200
	} else {
		statusCode = 400
	}

	bodyStr, _ := json.Marshal(ret)
	return events.APIGatewayProxyResponse{
		Body:       string(bodyStr),
		StatusCode: statusCode,
		Headers:    map[string]string{"Access-Control-Allow-Origin": "*", "Content-Type": "text/plain"},
	}, nil
}

func takeScreenshot() {
	if !strings.Contains(addr, "http") {
		addr = strings.Join([]string{"https://", addr}, "")
	}

	u, err := url.Parse(addr)
	if err != nil {
		log.Printf("%v", err)
	}

	randStr := shared.CreateRandString(6)
	if u.RawQuery == "" {
		fileName = strings.Join([]string{randStr, "-", u.Host, u.Path}, "")
	} else {
		fileName = strings.Join([]string{randStr, "-", u.Host, u.Path, "?", u.RawQuery}, "")
	}
	fileName = strings.Replace(fileName, "/", "_", -1)
	fileName = strings.Replace(fileName, ".", "-", -1)
	fileName += fileExt

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	devt := devtool.New("http://127.0.0.1:9222")
	pt, err := devt.Get(ctx, devtool.Page)
	if err != nil {
		pt, err = devt.Create(ctx)
		if err != nil {
			log.Printf("devt.Create err: %s", err)
		}
	}

	conn, err := rpcc.DialContext(ctx, pt.WebSocketDebuggerURL)
	if err != nil {
		log.Printf("%s", err)
	}
	defer conn.Close()

	c := cdp.NewClient(conn)

	for _, err := range []error{
		c.Page.Enable(ctx),
		c.DOM.Enable(ctx, dom.NewEnableArgs()),
		c.CSS.Enable(ctx),
	} {
		if err != nil {
			log.Printf("%s", err)
		}
	}

	loadEvent, err := c.Page.LoadEventFired(ctx)
	if err != nil {
		log.Printf("%s", err)
	}
	defer loadEvent.Close()

	navArgs := page.NewNavigateArgs(addr).
		SetReferrer("https://google.com")
	nav, err := c.Page.Navigate(ctx, navArgs)
	if err != nil {
		log.Printf("%s", err)
	}

	if _, err = loadEvent.Recv(); err != nil {
		log.Printf("%s", err)
	}

	doc, err := c.DOM.GetDocument(ctx, nil)
	if err != nil {
		log.Printf("%s", err)
	}

	if *doc.Root.ChildNodeCount < 2 { // If it's a blank page
		status = 0
		return
	}
	status = 1

	styleSheet, err := c.CSS.CreateStyleSheet(ctx, css.NewCreateStyleSheetArgs(nav.FrameID))
	if err != nil {
		log.Printf("%s", err)
	}

	cssText := (selectorsToHide + "{ display: none !important; }")
	_, err = c.CSS.SetStyleSheetText(ctx, css.NewSetStyleSheetTextArgs(
		styleSheet.StyleSheetID,
		cssText,
	))
	if err != nil {
		log.Printf("%s", err)
	}

	afterLoadedWait, _ := strconv.Atoi(os.Getenv("AFTER_LOADED_WAIT"))
	time.Sleep(time.Duration(afterLoadedWait) * time.Millisecond)

	pt, _ = devt.Get(ctx, devtool.Page)

	title = pt.Title
	title = strings.Replace(title, "&amp;", "&", -1)
	title = strings.Replace(title, "&#39;", "'", -1)

	screenshotq, _ := strconv.Atoi(os.Getenv("SCREENSHOT_JPG_QUALITY"))
	screenshotArgs := page.NewCaptureScreenshotArgs().
		SetFormat("jpeg").
		SetQuality(screenshotq)
	screenshot, err := c.Page.CaptureScreenshot(ctx, screenshotArgs)
	if err != nil {
		log.Printf("%s", err)
	}

	uploadScreenshot(fileName, screenshot)
}

func uploadScreenshot(fileName string, screenshot *page.CaptureScreenshotReply) {
	bucket := aws.String(bucketName)

	uploader := s3manager.NewUploader(session.New(&aws.Config{
		Region: aws.String(region)}),
	)

	imgBytes := bytes.NewReader(screenshot.Data)

	imgData, _, err := image.Decode(imgBytes)

	quality, _ := strconv.Atoi(os.Getenv("JPG_QUALITY"))
	options := jpeg.Options{Quality: quality}

	width, _ := strconv.Atoi(os.Getenv("RESOLUTION_W"))
	height, _ := strconv.Atoi(os.Getenv("RESOLUTION_H"))
	img := imaging.Resize(imgData, width, height, imaging.Lanczos)

	var buf bytes.Buffer
	err = jpeg.Encode(&buf, img, &options)
	if err != nil {
		log.Printf("%s", err)
	}

	b := buf.Bytes()

	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket:      bucket,
		Key:         aws.String(strings.Join([]string{"screenshots/", fileName}, "")),
		Body:        bytes.NewReader(b),
		ContentType: aws.String("image/jpeg"),
	})
	if err != nil {
		log.Printf("Upload fail")
	}

	log.Printf("%v Upload done", fileName)
}

func runHeadless() {
	path, _ := filepath.Abs(hcPath)
	cmd := exec.Command(path, "--headless", "--disable-gpu", "--no-zygote", "--no-first-run", "--prerender-from-omnibox=disabled",
		"--no-sandbox", "--hide-scrollbars", "--remote-debugging-port=9222", "--home-dir=/tmp", "--single-process",
		"--data-path=/tmp/data-dir", "--disk-cache-dir=/tmp/cache-dir", "--ignore-certificate-errors", "--disable-translate",
		"--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
		"--disable-default-apps", "--disable-extensions", "disk-cache-size=10000000", "--media-cache-size=10000000", "--window-size=1920, 1080")

	stderr, _ := cmd.StderrPipe()

	log.Printf("Cmd start")

	err := cmd.Start()
	if err != nil {
		log.Printf("cmd: %s", stderr)
	}

	scanner := bufio.NewScanner(stderr)
	scanner.Split(bufio.ScanWords)
	for scanner.Scan() {
		txt := scanner.Text()
		if strings.Contains(txt, "listening") { // When cmd outputs a string containing "listening", the headless chrome is running
			wg.Done()
			break
		}
	}

	err = cmd.Wait()
	log.Printf("Headless Chrome process ended with error: %v", err)
}

func main() {
	lambda.Start(LambdaHandler)
}
