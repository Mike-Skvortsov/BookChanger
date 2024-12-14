const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");

let driver;

beforeAll(async () => {
  driver = await new Builder().forBrowser("chrome").build();
  await driver.get("https://book-changer.vercel.app"); // URL твого фронтенду
}, 30000);

afterAll(async () => {
  await driver.quit();
});

describe("UI Tests: Registration Form", () => {
  test("Should register a new user successfully", async () => {
    await driver.findElement(By.id("email")).sendKeys("testuser@example.com");
    await driver.findElement(By.id("password")).sendKeys("password123");
    await driver.findElement(By.css(".next-button")).click();

    // Step 2 form
    await driver.findElement(By.id("name")).sendKeys("Test User");
    await driver.findElement(By.id("phone")).sendKeys("123456789");
    await driver.findElement(By.id("location")).sendKeys("Kyiv");
    await driver
      .findElement(By.id("description"))
      .sendKeys("Test user description");

    const fileInput = await driver.findElement(By.id("image"));
    const testImagePath = path.resolve(__dirname, "assets/test-image.jpg");
    await fileInput.sendKeys(testImagePath);

    await driver.findElement(By.css(".next-button")).click();

    // Очікуємо успішну реєстрацію
    await driver.wait(
      until.urlIs("https://book-changer.vercel.app/profile"),
      5000
    );
    const profileTitle = await driver
      .findElement(By.css(".profile-title"))
      .getText();
    expect(profileTitle).toContain("Welcome, Test User");
  });
});
