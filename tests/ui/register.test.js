const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

jest.setTimeout(30000); // Таймаут для всього тесту

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

describe("UI Tests: Registration Form", () => {
  test("Should register a new user successfully", async () => {
    try {
      console.log("Navigating to the app...");
      await driver.get("https://book-changer.vercel.app");

      console.log("Waiting for email input...");
      await driver.wait(until.elementLocated(By.id("email")), 15000);

      const emailInput = await driver.findElement(By.id("email"));
      const passwordInput = await driver.findElement(By.id("password"));
      const nextButton = await driver.findElement(By.css(".next-button"));

      console.log("Filling out the form...");
      await emailInput.sendKeys("testuser@example.com");
      await passwordInput.sendKeys("password123");
      await nextButton.click();

      console.log("Waiting for step 2...");
      await driver.wait(until.urlContains("/step2"), 15000);

      const nameInput = await driver.findElement(By.id("name"));
      const locationInput = await driver.findElement(By.id("location"));
      const descriptionInput = await driver.findElement(By.id("description"));
      const submitButton = await driver.findElement(By.css(".next-button"));

      await nameInput.sendKeys("Test User");
      await locationInput.sendKeys("Kyiv");
      await descriptionInput.sendKeys("Test description");
      await submitButton.click();

      console.log("Waiting for profile page...");
      await driver.wait(until.urlContains("/profile"), 15000);
      const profileHeader = await driver.findElement(By.css(".profile-header"));
      const profileText = await profileHeader.getText();

      expect(profileText).toContain("Test User");
    } catch (err) {
      console.error("Test failed. Taking screenshot...");
      await driver.takeScreenshot().then((image) => {
        fs.writeFileSync("screenshot.png", image, "base64");
      });
      throw err;
    }
  });
});
