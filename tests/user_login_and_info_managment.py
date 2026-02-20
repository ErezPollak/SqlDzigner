
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from time import sleep



def main():
    driver = webdriver.Chrome()
    driver.get("http://localhost:3000") 
    wait = WebDriverWait(driver, 10)


    #####################  create user #####################

    sleep(1)

    signup_button = driver.find_element(By.XPATH, "//button[text()='Sign up']")
    signup_button.click()

    username_input = driver.find_element(By.XPATH,  "(//form//input)[1]")
    username_input.send_keys("user")

    email_input = driver.find_element(By.XPATH,  "(//form//input)[2]")
    email_input.send_keys("user@blabla.bla")

    password_input = driver.find_element(By.XPATH,  "(//form//input)[3]")
    password_input.send_keys("aksjdfhlkjashdfklhalksj")

    sleep(1)

    create_account_button = driver.find_element(By.XPATH, "//button[text()='Create account']")
    create_account_button.click()

    component = wait.until(EC.presence_of_element_located((By.XPATH,  "//div[text()='Registered successfully — you can now log in']")))
    assert component.is_displayed()

    ##################### log in #####################

    username_login_input = driver.find_element(By.XPATH,  "(//form//input)[1]")
    username_login_input.send_keys("user")

    password_login_input = driver.find_element(By.XPATH,  "(//form//input)[2]")
    password_login_input.send_keys("aksjdfhlkjashdfklhalksj")

    sleep(1)

    login_button = driver.find_element(By.XPATH, "//button[text()='Log in']")
    login_button.click()

    home_screen_component = wait.until(EC.presence_of_element_located((By.XPATH,  "//h2[text()='My Schemas']")))
    assert home_screen_component.is_displayed()

    #####################  set profile with data #####################

    edit_profile_button = driver.find_element(By.XPATH, "//button[text()='Profile']")
    edit_profile_button.click()

    sleep(1)

    full_name_input = driver.find_element(By.XPATH,  "(//form//input)[1]")
    full_name_input.send_keys("user mendelovich")

    update_email_input = driver.find_element(By.XPATH,  "(//form//input)[2]")
    update_email_input.send_keys("usermendelovich@blablabbla.bla")

    update_phone_input = driver.find_element(By.XPATH,  "(//form//input)[3]")
    update_phone_input.send_keys("051-111-1111")

    sleep(1)

    save_update_button = driver.find_element(By.XPATH, "//button[text()='Save']")
    save_update_button.click()

    updated_successfuly_component = wait.until(EC.presence_of_element_located((By.XPATH,  "//div[text()='Profile updated']")))
    assert updated_successfuly_component.is_displayed()

    #####################  delete account #####################

    sleep(1)

    save_update_button = driver.find_element(By.XPATH, "//button[text()='Delete account']")
    save_update_button.click()

    sleep(1)

    alert = WebDriverWait(driver, 10).until(EC.alert_is_present())
    alert.accept()

    login_page_componant = wait.until(EC.presence_of_element_located((By.XPATH,  "//h1[text()='SQL Dezigner']")))
    assert login_page_componant.is_displayed()

    sleep(1)


if __name__ == '__main__':
    main()