import requests
import time
import random

for x in range(11):
    a = random.randint(100, 999)
    b = random.randint(1000, 9999)
    c = random.randint(1, 5)
    s = "ativo"
    if c == 1:
        s = "inativo"
    elif c == 2:
        s = "cancelado"
    else:
        s = "ativo" 
    print("Request: " + str(x) +  ": cnpj=11-" + str(a) + "88888-0002" +  str(b) + " status=" + str(s))
    url = "http://<server>:3000/empresa?id=TDC001&estado=SP&situacao=" + str(s) + "&cnpj=11-" + str(a) + "88888-0002" +  str(b)
    x = requests.get(url)
    time.sleep(3)
print(x.text)

