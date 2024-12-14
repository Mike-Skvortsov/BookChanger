const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome"); // Імпорт chrome
const assert = require("assert");

describe("UI Tests with Selenium", () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(
        new chrome.Options()
          .headless() // Запуск у headless режимі
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
    // Відкриваємо сторінку логіну
    await driver.get("https://book-changer.vercel.app/login");

    // Вводимо email
    const emailInput = await driver.findElement(By.id("email"));
    await emailInput.sendKeys("mixaylo.skv@gmail.com");

    // Вводимо пароль
    const passwordInput = await driver.findElement(By.id("password"));
    await passwordInput.sendKeys("qawsed123SS");

    // Клікаємо кнопку "Далі"
    const loginButton = await driver.findElement(By.css(".next-button"));
    await loginButton.click();

    // Перевіряємо, чи перенаправлено на сторінку профілю
    await driver.wait(until.urlContains("/profile"), 5000);
    const currentUrlAfterLogin = await driver.getCurrentUrl();
    assert.ok(
      currentUrlAfterLogin.includes("/profile"),
      "Логін не завершився успішно."
    );

    console.log("Логін успішний, продовжуємо тест.");

    // Відкриваємо сторінку додавання автора
    await driver.get("https://book-changer.vercel.app/add-author");

    // Заповнюємо ім'я автора
    const nameInput = await driver.findElement(By.id("name"));
    await nameInput.sendKeys("Тестовий Автор");

    // Заповнюємо дату народження
    const bDayInput = await driver.findElement(By.id("bDay"));
    await bDayInput.sendKeys("2000-01-01");

    // Вибираємо статус автора
    const statusSelect = await driver.findElement(By.id("authorStatus"));
    await statusSelect.sendKeys("alive");

    // Заповнюємо опис автора
    const descriptionInput = await driver.findElement(By.id("description"));
    await descriptionInput.sendKeys(
      "Це тестовий автор з короткою характеристикою для UI тестів."
    );

    // Завантажуємо зображення
    const fileInput = await driver.findElement(By.id("image"));
    await fileInput.sendKeys(`./test-image.jpg`);

    // Клікаємо на кнопку "Далі"
    const submitButton = await driver.findElement(By.css(".next-button"));
    await submitButton.click();

    // Перевіряємо, чи перенаправлено на сторінку додавання книги
    await driver.wait(until.urlContains("/add-book"), 5000);
    const currentUrlAfterSubmit = await driver.getCurrentUrl();
    assert.ok(
      currentUrlAfterSubmit.includes("/add-book"),
      "Додавання автора не завершилося успішно."
    );

    console.log("Тест успішно пройдено!");
  });
});
