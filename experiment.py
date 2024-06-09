import sys
sys.path.append("../")
from funct import *
import pyautogui
from random import randint
import subprocess
import time
import shlex
import random
import shutil
import os
import psutil
import xlwt


# constants:
timeSleep1 = 5
timeSleep2 = 10


# работа с файлом exel
book = xlwt.Workbook(encoding="utf-8")

# Add a sheet to the workbook 
sheet_atypical_dist_1 = book.add_sheet("Atypical distances 1 1")
sheet_atypical_dist_2 = book.add_sheet("Atypical distances 2 5")
sheet_atypical_dist_3 = book.add_sheet("Atypical distances 5 2")
sheet_atypical_dist_4 = book.add_sheet("Atypical distances 5 10")
sheet_atypical_dist_5 = book.add_sheet("Atypical distances 10 5")
sheet_atypical_dist_6 = book.add_sheet("Atypical distances 10 20")
sheet_atypical_dist_7 = book.add_sheet("Atypical distances 20 10")

sheet_time_1 = book.add_sheet("Times 1 1")
sheet_time_2 = book.add_sheet("Times 2 5")
sheet_time_3 = book.add_sheet("Times 5 2")
sheet_time_4 = book.add_sheet("Times 5 10")
sheet_time_5 = book.add_sheet("Times 10 5")
sheet_time_6 = book.add_sheet("Times 10 20")
sheet_time_7 = book.add_sheet("Times 20 10")


for j in range(10):
    sheet_atypical_dist_1.write(0, j+1, j+1)
    sheet_atypical_dist_2.write(0, j+1, j+1)
    sheet_atypical_dist_3.write(0, j+1, j+1)
    sheet_atypical_dist_4.write(0, j+1, j+1)
    sheet_atypical_dist_5.write(0, j+1, j+1)
    sheet_atypical_dist_6.write(0, j+1, j+1)
    sheet_atypical_dist_7.write(0, j+1, j+1)
    sheet_time_1.write(0, j+1, j+1)
    sheet_time_2.write(0, j+1, j+1)
    sheet_time_3.write(0, j+1, j+1)
    sheet_time_4.write(0, j+1, j+1)
    sheet_time_5.write(0, j+1, j+1)
    sheet_time_6.write(0, j+1, j+1)
    sheet_time_7.write(0, j+1, j+1)

    
for i in range(4):
    print('-'*15)
    print("№ цикла:", i)
    print('-'*15)
    # удаление файлов из lerningData
    lerningData = "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\learningData"
    for f in os.listdir(lerningData):
        os.remove(os.path.join(lerningData, f))
        
    # копирование файлов в firefox_100_by_20
    firefox_100_by_20_sourse = "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1_source"
    for f in os.listdir(firefox_100_by_20_sourse):
        shutil.copy(firefox_100_by_20_sourse + "\\" + f, "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1" + "\\" + f)

    # получение log-файлов
    content = os.listdir("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1")
    print(len(content))

    # перемещение случайного log-файла в папку learningData, и запуск обчения
    n = random.randint(0, len(content)-1)
    new_location = shutil.move("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\"+str(content[n]), "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\learningData")
    content.pop(n)
    
    try:
        test_process = subprocess.run(["node", "train2.js", "20"], shell=True, check=True)
        print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
    except subprocess.CalledProcessError as e:
        print(f"Программа trian завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
        break

    shutil.copy2("model2.json", "model_0.json")
    '''
    newFolder = "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_firefox\\"+str(i)
    new_location = shutil.move("\\Users\\ttnpv\\Documents\\expl\\analyszer-main_firefox\\model_0.json", newFolder)
    '''
    k = 1
    while len(content) != 0:
        num_str = 106 - len(content)
        if (i == 0):
            sheet_atypical_dist_1.write(num_str, 0, num_str)
            sheet_atypical_dist_2.write(num_str, 0, num_str)
            sheet_atypical_dist_3.write(num_str, 0, num_str)
            sheet_atypical_dist_4.write(num_str, 0, num_str)
            sheet_atypical_dist_5.write(num_str, 0, num_str)
            sheet_atypical_dist_6.write(num_str, 0, num_str)
            sheet_atypical_dist_7.write(num_str, 0, num_str)
             
            sheet_time_1.write(num_str, 0, num_str)
            sheet_time_2.write(num_str, 0, num_str)
            sheet_time_3.write(num_str, 0, num_str)
            sheet_time_4.write(num_str, 0, num_str)
            sheet_time_5.write(num_str, 0, num_str)
            sheet_time_6.write(num_str, 0, num_str)
            sheet_time_7.write(num_str, 0, num_str)
            
        
        # удаление файлов из checkData
        checkData = "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\checkData"
        for f in os.listdir(checkData):
            os.remove(checkData + "\\" + f)
            
        # перемещение случайного log-файла в папку checkData, и запуск тестирования
        n = random.randint(0, len(content)-1)
        new_location = shutil.move("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n], checkData)
        time.sleep(timeSleep1)

        # тестирование TD = 1 CD = 1
        try:
            test_process = subprocess.run(["node", "test2_1.js", "1", "1"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
       
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_1.write(num_str, i+1, cnt_dist)
        sheet_time_1.write(num_str, i+1, cnt_time)
        
   
        # тестирование TD = 2 CD = 5
        try:
            test_process = subprocess.run(["node", "test2_1.js", "2", "5"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_2.write(num_str, i+1, cnt_dist)
        sheet_time_2.write(num_str, i+1, cnt_time)

        # тестирование TD = 5 CD = 2
        try:
            test_process = subprocess.run(["node", "test2_1.js", "5", "2"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_3.write(num_str, i+1, cnt_dist)
        sheet_time_3.write(num_str, i+1, cnt_time)

        # тестирование TD = 5 CD = 10
        try:
            test_process = subprocess.run(["node", "test2_1.js", "5", "10"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
        
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_4.write(num_str, i+1, cnt_dist)
        sheet_time_4.write(num_str, i+1, cnt_time)
        
        # тестирование TD = 10 CD = 5
        try:
            test_process = subprocess.run(["node", "test2_1.js", "10", "5"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
        
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_5.write(num_str, i+1, cnt_dist)
        sheet_time_5.write(num_str, i+1, cnt_time)
        
        # тестирование TD = 10 CD = 20
        try:
            test_process = subprocess.run(["node", "test2_1.js", "10", "20"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
        
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_6.write(num_str, i+1, cnt_dist)
        sheet_time_6.write(num_str, i+1, cnt_time)

        # тестирование TD = 20 CD = 10
        try:
            test_process = subprocess.run(["node", "test2_1.js", "2", "5"], shell=True, check=True)
            print("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\DAY1\\" + content[n])
        except subprocess.CalledProcessError as e:
            print(f"Программа завершила выполнение с ошибкой. Код ошибки: {e.returncode}")
            break
        
        with open('output.txt', 'r') as f:
            cnt_time = int(f.readline())
            cnt_dist = int(f.readline())
        sheet_atypical_dist_7.write(num_str, i+1, cnt_dist)
        sheet_time_7.write(num_str, i+1, cnt_time)

        # удаление файлов из addLerningData
        addLearningData = "C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\addLearningdata"
        for f in os.listdir(addLearningData):
            os.remove(addLearningData + "\\" + f)
            
        for f in os.listdir(checkData):
            new_location = shutil.move(checkData+ "\\" + f, addLearningData)
        
        
        subprocess.run(["node", "add_train2.js", "20"], shell=True)
        time.sleep(timeSleep2)
        '''
        shutil.copy2("model2.json", "model"+ '_' + str(k) + ".json")

        new_location = shutil.move("C:\\Users\\ttnpv\\Documents\\expl\\analyszer-main_minibrowser\\model_" + str(k) + ".json", newFolder)

        k += 1
        '''
        content.pop(n)
        print(len(content))

    # Save the workbook 
    book.save("maxton4.xls")


