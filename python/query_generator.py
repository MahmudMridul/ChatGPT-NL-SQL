import openai
import pypyodbc as odbc
import json
import decimal
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# set up connection parameters
server = 'server'
database = 'db'
username = 'user'
password = 'pass'
driver2 = 'SQL Server'
connection_string = f"""DRIVER={{{driver2}}};SERVER={server};DATABASE={database};UID=<username>;PWD=<password>;Trusted_Connection=yes"""

def define_parameters(user_request):
    command = user_request
    internal_prompt = '### Microsoft SQL server table, with their properties:\n#\n# dbo.Test_Drug_Data(BrandId, BrandName, DrugType, DrugSlug, DosageForm, Generic, Strength, Manufacturer, Price)\n#\n# Always return atleast BrandID, BrandName, Manufacturer, DosageForm, Strength, Price columns \n#\n# Generate T-SQL queries only \n#\n# A query to ' + command + '\nSELECT'
    return internal_prompt

def get_drug_info(internal_prompt):
    openai.api_key = "apikey" 
    print(internal_prompt)
    response = openai.Completion.create(
        engine="code-davinci-002",
        prompt = internal_prompt,
        temperature=0,
        max_tokens=150,
        top_p=1.0,
        frequency_penalty=0.0,
        presence_penalty=0.0,
        stop=["#", ";"]
        )
    suggestions = response.choices[0].text.strip()
        
    return suggestions

def create_json(rows, col_names):
    column_names = col_names
    data = rows
    
    json_list = []
    
    for row in data:
        json_obj = {}
        for i in range(len(column_names)):
            if isinstance(row[i], decimal.Decimal):
                json_obj[column_names[i]] = float(row[i])
            else:          
                json_obj[column_names[i]] = row[i]
        json_list.append(json_obj)
    json_output = json.dumps(json_list)
    print(json_output)
    return json_output

    
def server_connect(connection_string, query): 
    cnxn = odbc.connect(connection_string)
    cursor = cnxn.cursor()
    print("SELECT " + query)
    cursor.execute("SELECT " + query)
    rows = cursor.fetchall()
    
    col_names = [desc[0] for desc in cursor.description]
  
    cursor.close()
    cnxn.close()
    
    output = create_json(rows, col_names)
    
    return output

@app.route('/api/submit', methods=['POST'])
def submit():
    try:
        user_request = request.json.get('request')
        internal_prompt = define_parameters(user_request)
        query = get_drug_info(internal_prompt)
        output = server_connect(connection_string, query)
        return output
    except:
        return ("-1")
    
if __name__ =='__main__':
    app.run()
