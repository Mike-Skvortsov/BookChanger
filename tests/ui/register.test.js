const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

jest.setTimeout(45000); // Збільшуємо таймаут для тесту

let driver;

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments("--headless");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-gpu");

  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

describe("UI Tests: HomePage", () => {
  test("Should load and display books correctly", async () => {
    try {
      console.log("Navigating to the HomePage...");
      await driver.get("https://book-changer.vercel.app/");

      console.log("Waiting for page load...");
      await driver.wait(async () => {
        const readyState = await driver.executeScript(
          "return document.readyState"
        );
        return readyState === "complete";
      }, 20000);

      console.log("Checking for the books section...");
      await driver.wait(until.elementLocated(By.css(".books-section")), 20000);

      console.log("Checking if books are displayed...");
      const books = await driver.findElements(
        By.css(".book-card-on-looks-books")
      );

      expect(books.length).toBeGreaterThan(0); // Перевіряємо, що книги завантажились

      console.log(`Found ${books.length} books.`);

      // Клік на першу книгу
      if (books.length > 0) {
        console.log("Clicking on the first book...");
        const firstBook = books[0];
        await firstBook.click();

        console.log("Waiting for navigation to the book details...");
        await driver.wait(until.urlContains("/books/"), 10000);

        const currentUrl = await driver.getCurrentUrl();
        console.log("Current URL:", currentUrl);
        expect(currentUrl).toContain("/books/");
      }
    } catch (err) {
      console.error("Test failed. Taking screenshot and saving page source...");
      const pageSource = await driver.getPageSource();
      fs.writeFileSync("pageSource.html", pageSource);

      await driver.takeScreenshot().then((image) => {
        fs.writeFileSync("screenshot.png", image, "base64");
      });

      throw err;
    }
  });
});
