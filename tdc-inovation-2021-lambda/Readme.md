# Editar o arquivo index.js

vi index.js

# zip file

zip -r function.zip .

# Update lambda

aws lambda update-function-code --function-name <function> --zip-file fileb://function.zip
