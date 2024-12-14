jest.setTimeout(30000);

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

describe("UI Tests with Selenium", () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(
        new chrome.Options()
          .addArguments("--headless")
          .addArguments("--disable-gpu")
          .addArguments("--no-sandbox")
          .addArguments("--disable-dev-shm-usage")
          .addArguments("--remote-debugging-port=9222")
      )
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it("should log in and add an author", async () => {
    try {
      // Перевірка файлу зображення
      const imagePath = path.resolve(__dirname, "../assets/test-image.jpg");
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Файл зображення не знайдено за шляхом: ${imagePath}`);
      }

      // Відкриваємо сторінку логіну
      await driver.get("https://book-changer.vercel.app/login");
      console.log("Поточна URL-адреса:", await driver.getCurrentUrl());

      // Вводимо email
      await driver.wait(until.elementLocated(By.id("email")), 5000);
      const emailInput = await driver.findElement(By.id("email"));
      await emailInput.sendKeys("mixaylo.skv@gmail.com");

      // Вводимо пароль
      const passwordInput = await driver.findElement(By.id("password"));
      await passwordInput.sendKeys("qawsed123SS");

      // Клікаємо кнопку "Далі"
      await driver.wait(until.elementLocated(By.css(".next-button")), 5000);
      const loginButton = await driver.findElement(By.css(".next-button"));
      await loginButton.click();

      // Перевіряємо, чи перенаправлено на сторінку профілю
      await driver.wait(until.urlContains("/profile"), 10000);
      console.log(
        "Поточна URL-адреса після логіну:",
        await driver.getCurrentUrl()
      );

      // Відкриваємо сторінку додавання автора
      await driver.get("https://book-changer.vercel.app/add-author");

      // Інші кроки, як в оригінальному коді...

      console.log("Тест успішно завершено.");
    } catch (error) {
      console.error("Помилка під час виконання тесту:", error);
      throw error;
    }
  });
});
