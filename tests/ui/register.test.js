const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

jest.setTimeout(60000); // Збільшений таймаут для тесту

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

describe("UI Тести: Додавання книги", () => {
  test("Повинно створити нову книгу успішно", async () => {
    try {
      console.log("Виконуємо вхід у систему...");
      await driver.get("https://book-changer.vercel.app/login");

      // Логін
      await driver
        .findElement(By.id("email"))
        .sendKeys("mixaylo.skv@hmail.com");
      await driver.findElement(By.id("password")).sendKeys("#qawsed123SS");
      await driver.findElement(By.css("button[type='submit']")).click();

      console.log("Очікуємо на редирект після логіну...");
      await driver.wait(until.urlIs("https://book-changer.vercel.app/"), 20000);

      console.log("Переходимо на сторінку додавання книги...");
      await driver.get("https://book-changer.vercel.app/add-book");

      console.log("Заповнюємо форму додавання книги...");

      // Назва книги
      await driver.findElement(By.id("title")).sendKeys("Тестова Книга");

      // Вибір автора
      const authorSelect = await driver.findElement(By.id("authors"));
      await authorSelect.findElement(By.css("option[value='1']")).click();

      // Вибір жанру
      const genreSelect = await driver.findElement(By.id("genres"));
      await genreSelect.findElement(By.css("option[value='1']")).click();

      // Мова
      await driver.findElement(By.id("language")).sendKeys("Українська");

      // Ціна
      await driver.findElement(By.id("announcedPrice")).sendKeys("100");

      // Кількість сторінок
      await driver.findElement(By.id("pageCount")).sendKeys("300");

      // Стан книги
      await driver.findElement(By.id("condition")).sendKeys("Новий");

      // Опис книги
      await driver
        .findElement(By.id("description"))
        .sendKeys("Це тестова книга для перевірки UI.");

      console.log("Відправляємо форму...");
      await driver.findElement(By.css("button[type='submit']")).click();

      console.log("Очікуємо підтвердження або редирект на 'Мої книги'...");
      await driver.wait(until.urlContains("/myBooks"), 10000);

      const currentUrl = await driver.getCurrentUrl();
      console.log("Поточний URL:", currentUrl);

      // Перевірка редиректу
      expect(currentUrl).toContain("/myBooks");

      console.log("Перевіряємо, чи книга створена...");
      const bookTitle = await driver.findElement(
        By.xpath("//*[contains(text(), 'Тестова Книга')]")
      );
      expect(bookTitle).toBeTruthy();
      console.log("Книга успішно створена!");
    } catch (err) {
      console.error(
        "Тест провалено. Зберігаємо скріншот та вихідний код сторінки..."
      );
      const pageSource = await driver.getPageSource();
      fs.writeFileSync("pageSource.html", pageSource);

      await driver.takeScreenshot().then((image) => {
        fs.writeFileSync("screenshot.png", image, "base64");
      });

      throw err;
    }
  });
});
