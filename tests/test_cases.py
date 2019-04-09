# import required libraries
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select


# define web browser driver to use
driver = webdriver.Chrome(r'C:\Users\100554361\Documents\GitHub\cloudproject\drivers\chromedriver.exe')
# set page load timeout to seconds
driver.implicitly_wait(10)
# load specified web page in a browser session
driver.get('http://68.183.207.31:5000/')


def login_test():
    # set the credentials to test
    email = 'devante.wilson@outlook.com'
    password = 'testpass123'

    # click login button upon presence of login button
    driver.execute_script("document.querySelectorAll('#login')[0].click()")
    driver.execute_script("document.querySelectorAll('#loginBtn')[0].click()")
    print('Login page is ready.')

    # locate the email address field and enter the email
    driver.find_element_by_id("emailLogin").send_keys(email)
    print('Email entered into form.')

    # locate the password field and enter the password
    driver.find_element_by_id("passwordLogin").send_keys(password)
    print('Password entered into form.')

    # locate the sumbit button and submit the form
    driver.find_element_by_id("loginBtn").click()
    print('Logged in successfully.')


def join_room_test():
    # locate the 'join a public room' button and click it
    driver.find_element_by_id("joinRoom").send_keys(Keys.ENTER)
    print('Clicked the "join a public room" button.')

    # select an available room from the room list
    driver.find_element_by_class_name('collection-item').click()
    print('Selected an available room.')


def send_message_test():
    # define a test message
    testMessage = 'Test message; sent from Selenium.'
    # locate the 'message' text field and type message
    driver.find_element_by_id('message').send_keys(testMessage)
    print('Entered a message into text field.')
    # locate the send button and click it
    #driver.find_element_by_name('action').click()
    driver.find_element_by_id('message').send_keys(Keys.ENTER)
    print('Sent the message.')


def create_question_test():
    # locate the 'question mode' button and click it
    driver.find_element_by_id('startQuestion').click()
    print('Clicked "Question Mode" button.')
    # locate the 'choose question type' drop down box and click it
    questionType = driver.find_elements_by_class_name('select-dropdown')
    questionType[0].click()
    print('Clicked dropdown field.')
    # locate the 'True/False' option and click it
    driver.execute_script('$("#qType").val("1").trigger("change");')
    print('Selected question type.')
    # locate the 'question' text field and type question
    questionMessage = 'Is this visible?'
    driver.find_element_by_id('question').send_keys(questionMessage)
    print('Typed question text.')
    # locate the 'true' checkbox and click it
    driver.execute_script('$("#true").prop("checked", true)')
    print('Checked the checkbox option.')
    # click the 'submit' button
    driver.find_element_by_id('sendQuestions').click()
    print('Created a question.')

# attempt to execute test cases
try:
    login_test()
    join_room_test()
    #send_message_test()
    create_question_test()

    # quit the driver and close every associated window
    #driver.quit()

except TimeoutException:
    print('Loading of the "login" element took too long.')
