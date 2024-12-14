const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

let driver;

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments("--headless"); // Запуск Chrome у headless режимі
  options.addArguments("--disable-dev-shm-usage"); // Для обмежень Docker
  options.addArguments("--no-sandbox"); // Для CI/CD середовища
  options.addArguments("--disable-gpu"); // Відключає GPU

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
    await driver.get("https://book-changer.vercel.app");

    const emailInput = await driver.findElement(By.id("email"));
    const passwordInput = await driver.findElement(By.id("password"));
    const nextButton = await driver.findElement(By.css(".next-button"));

    await emailInput.sendKeys("testuser@example.com");
    await passwordInput.sendKeys("password123");
    await nextButton.click();

    await driver.wait(until.urlContains("/step2"), 5000); // Очікуємо перехід на другий крок
    const nameInput = await driver.findElement(By.id("name"));
    const locationInput = await driver.findElement(By.id("location"));
    const descriptionInput = await driver.findElement(By.id("description"));
    const submitButton = await driver.findElement(By.css(".next-button"));

    await nameInput.sendKeys("Test User");
    await locationInput.sendKeys("Kyiv");
    await descriptionInput.sendKeys("Test description");
    await submitButton.click();

    await driver.wait(until.urlContains("/profile"), 5000); // Очікуємо перехід на сторінку профілю
    const profileHeader = await driver.findElement(By.css(".profile-header"));
    const profileText = await profileHeader.getText();

    expect(profileText).toContain("Test User");
  });
});
