from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def main():
    driver = webdriver.Chrome()
    driver.get("http://localhost:3000") 
    wait = WebDriverWait(driver, 10)

    try:
        # --- 1. SIGN UP (Création impérative du compte) ---
        print("Creating account...")
        signup_button = driver.find_element(By.XPATH, "//button[text()='Sign up']")
        signup_button.click()

        # On utilise les index (1, 2, 3) comme dans le test de votre collègue
        driver.find_element(By.XPATH, "(//form//input)[1]").send_keys("test_user_schema")
        driver.find_element(By.XPATH, "(//form//input)[2]").send_keys("schema@test.com")
        driver.find_element(By.XPATH, "(//form//input)[3]").send_keys("password123")
        
        driver.find_element(By.XPATH, "//button[text()='Create account']").click()
        
        # Attendre la confirmation d'inscription
        wait.until(EC.presence_of_element_located((By.XPATH, "//div[text()='Registered successfully — you can now log in']")))
        print("Account created successfully.")

        # --- 2. LOG IN ---
        print("Logging in...")
        driver.find_element(By.XPATH, "(//form//input)[1]").send_keys("test_user_schema")
        driver.find_element(By.XPATH, "(//form//input)[2]").send_keys("password123")
        driver.find_element(By.XPATH, "//button[text()='Log in']").click()

        # Vérifier l'arrivée sur la page Home
        wait.until(EC.presence_of_element_located((By.XPATH, "//h2[text()='My Schemas']")))

        # --- 3. CREATE & EDIT SCHEMA (Votre nouvelle fonctionnalité) ---
        print("Testing Schema creation...")
        # On cherche le bouton pour créer un schéma
        create_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create')]")))
        create_btn.click()
        
        # On clique sur Edit pour ouvrir le fameux EML Dialog
        edit_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Edit']")))
        edit_btn.click()

        # Vérification visuelle que le dialogue EML est ouvert
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'EML')]")))
        print("EML Dialog verified!")
        time.sleep(2) 

        # --- 4. CLEANUP (Suppression pour pouvoir relancer le test plus tard) ---
        print("Cleaning up (Deleting account)...")
        driver.find_element(By.XPATH, "//button[text()='Profile']").click()
        delete_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Delete account']")))
        delete_btn.click()

        # Accepter l'alerte de confirmation
        wait.until(EC.alert_is_present())
        driver.switch_to.alert.accept()
        print("Test complete and account deleted.")

    except Exception as e:
        print(f"Error during test: {e}")
    
    finally:
        driver.quit()

if __name__ == '__main__':
    main()