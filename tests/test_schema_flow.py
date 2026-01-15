from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import datetime

def main():
    driver = webdriver.Chrome()
    driver.get("http://localhost:3000") 
    wait = WebDriverWait(driver, 10)

    try:
        print("=== ÉTAPE 1: CRÉATION DU COMPTE ===")
        signup_button = driver.find_element(By.XPATH, "//button[text()='Sign up']")
        signup_button.click()
        time.sleep(1)

        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        username = f"test_user_{timestamp}"
        email = f"test_{timestamp}@test.com"
        
        print(f"Username: {username}")
        print(f"Email: {email}")
        
        driver.find_element(By.XPATH, "(//form//input)[1]").send_keys(username)
        time.sleep(0.5)
        driver.find_element(By.XPATH, "(//form//input)[2]").send_keys(email)
        time.sleep(0.5)
        driver.find_element(By.XPATH, "(//form//input)[3]").send_keys("password123")
        time.sleep(0.5)
        
        driver.find_element(By.XPATH, "//button[text()='Create account']").click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//div[text()='Registered successfully — you can now log in']")))
        print("✓ Compte créé avec succès\n")
        time.sleep(2)

        print("=== ÉTAPE 2: CONNEXION ===")
        driver.find_element(By.XPATH, "(//form//input)[1]").send_keys(username)
        time.sleep(0.5)
        driver.find_element(By.XPATH, "(//form//input)[2]").send_keys("password123")
        time.sleep(0.5)
        driver.find_element(By.XPATH, "//button[text()='Log in']").click()
        time.sleep(2)

        wait.until(EC.presence_of_element_located((By.XPATH, "//h2[text()='My Schemas']")))
        print("✓ Connexion réussie\n")
        time.sleep(2)

        print("=== ÉTAPE 3: CRÉATION DU SCHÉMA ===")
        schema_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='New Schema Name']")))
        schema_input.send_keys("TestSchema_Selenium")
        time.sleep(1)
        
        create_schema_btn = driver.find_element(By.XPATH, "//button[text()='Create Schema']")
        create_schema_btn.click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//strong[text()='TestSchema_Selenium']")))
        print("✓ Schéma 'TestSchema_Selenium' créé\n")
        time.sleep(2)

        print("=== ÉTAPE 4: OUVERTURE DU SCHÉMA ===")
        view_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//strong[text()='TestSchema_Selenium']/ancestor::li//button[text()='View']")))
        view_btn.click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//h3[text()='Tables']")))
        print("✓ Schéma ouvert\n")
        time.sleep(2)

        print("=== ÉTAPE 5: AJOUT D'UNE TABLE ===")
        table_input = driver.find_element(By.XPATH, "//input[@placeholder='New Table Name']")
        table_input.send_keys("Users")
        time.sleep(1)
        
        add_table_btn = driver.find_element(By.XPATH, "//button[text()='Add Table']")
        add_table_btn.click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//strong[text()='Users']")))
        print("✓ Table 'Users' ajoutée\n")
        time.sleep(2)

        print("=== ÉTAPE 6: ÉDITION DE LA TABLE ===")
        edit_table_btn = driver.find_element(By.XPATH, "//strong[text()='Users']/ancestor::li//button[text()='Edit']")
        edit_table_btn.click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//h3[text()='Editing: Users']")))
        print("✓ Mode édition activé\n")
        time.sleep(2)

        print("Ajout du champ 'id'...")
        field_input = driver.find_element(By.XPATH, "//input[@placeholder='Field Name']")
        field_input.send_keys("id")
        time.sleep(1)
        
        field_type = driver.find_element(By.XPATH, "//select[@class='small-input']")
        field_type.click()
        time.sleep(0.5)
        driver.find_element(By.XPATH, "//option[@value='INT']").click()
        time.sleep(0.5)
        
        add_field_btn = driver.find_element(By.XPATH, "//button[text()='Add Field']")
        add_field_btn.click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//span[@class='field-name' and text()='id']")))
        print("✓ Champ 'id' (INT) ajouté")
        time.sleep(2)

        print("Ajout du champ 'username'...")
        field_input = driver.find_element(By.XPATH, "//input[@placeholder='Field Name']")
        field_input.clear()
        time.sleep(0.5)
        field_input.send_keys("username")
        time.sleep(1)
        
        field_type = driver.find_element(By.XPATH, "//select[@class='small-input']")
        field_type.click()
        time.sleep(0.5)
        driver.find_element(By.XPATH, "//option[@value='VARCHAR']").click()
        time.sleep(0.5)
        
        add_field_btn.click()
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//span[@class='field-name' and text()='username']")))
        print("✓ Champ 'username' (VARCHAR) ajouté\n")
        time.sleep(2)

        print("=== ÉTAPE 7: MODIFICATION DU SCHÉMA ===")
        print("Suppression du champ 'username'...")
        delete_field_btn = driver.find_element(By.XPATH, "//span[text()='username']/ancestor::li//button[text()='Delete']")
        delete_field_btn.click()
        time.sleep(2)
        
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//span[@class='field-name' and text()='username']")))
        print("✓ Champ 'username' supprimé\n")
        time.sleep(2)

        print("=== ÉTAPE 8: SUPPRESSION DE LA TABLE ===")
        close_edit_btn = driver.find_element(By.XPATH, "//strong[text()='Users']/ancestor::li//button[text()='Close']")
        close_edit_btn.click()
        time.sleep(2)
        
        delete_table_btn = driver.find_element(By.XPATH, "//strong[text()='Users']/ancestor::li//button[text()='Delete']")
        delete_table_btn.click()
        time.sleep(2)
        
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//strong[text()='Users']")))
        print("✓ Table 'Users' supprimée\n")
        time.sleep(2)

        print("=== ÉTAPE 9: SUPPRESSION DU SCHÉMA ===")
        close_schema_btn = driver.find_element(By.XPATH, "//strong[text()='TestSchema_Selenium']/ancestor::li//button[text()='Close']")
        close_schema_btn.click()
        time.sleep(2)
        
        delete_schema_btn = driver.find_element(By.XPATH, "//strong[text()='TestSchema_Selenium']/ancestor::li//button[text()='Delete']")
        delete_schema_btn.click()
        time.sleep(2)
        
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//strong[text()='TestSchema_Selenium']")))
        print("✓ Schéma 'TestSchema_Selenium' supprimé\n")
        time.sleep(2)

        print("=== ÉTAPE 10: SUPPRESSION DU COMPTE ===")
        profile_btn = driver.find_element(By.XPATH, "//button[text()='Profile']")
        profile_btn.click()
        time.sleep(3)
        
        print("Recherche du bouton 'Delete account'...")
        delete_account_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Delete account']")))
        print("✓ Bouton trouvé, clic sur 'Delete account'...")
        delete_account_btn.click()
        time.sleep(3)

        print("Vérification de la présence d'une alerte...")
        try:
            wait.until(EC.alert_is_present(), timeout=5)
            print("✓ Alerte détectée, acceptation...")
            driver.switch_to.alert.accept()
            print("✓ Alerte acceptée")
            time.sleep(2)
        except:
            print("✓ Pas d'alerte JavaScript détectée")
        
        print("Vérification de la redirection vers la page d'authentification...")
        time.sleep(3)
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[text()='Sign up']")))
        print("✓ Compte supprimé avec succès!")
        print("✓ Redirection vers la page d'authentification confirmée")
        time.sleep(3)
        
        print("\n" + "="*50)
        print("🎉 TEST COMPLET - TOUTES LES ÉTAPES RÉUSSIES 🎉")
        print("="*50)

    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        time.sleep(3)
        driver.quit()

if __name__ == '__main__':
    main()