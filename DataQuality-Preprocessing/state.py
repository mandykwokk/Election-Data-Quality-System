import mysql.connector
import csv, json
import os
import geopandas as gp


db = mysql.connector.connect(
    #host='mysql3.cs.stonybrook.edu', user = 'runjiang', password="110998233", database = 'runjiang'
    host="mysql3.cs.stonybrook.edu", user="hanliu2", passwd="111455416", db="hanliu2"
    
)

mycursor = db.cursor()
demoDir = os.path.join(os.path.dirname(__file__), "2010Demo")
stateGeoDir = os.path.join(os.path.dirname(__file__), "state")
statDemoPaths = [os.path.join(demoDir, 'OH2010.csv'), os.path.join(
    demoDir, 'NJ2010.csv'), os.path.join(demoDir, 'MS2010.csv')]
stateGeoPaths = [os.path.join(stateGeoDir, 'OH.geojson'), os.path.join(
    stateGeoDir, 'NJ.geojson'), os.path.join(stateGeoDir, 'MS.geojson')]




#mycursor.execute("DROP TABLE state")
mycursor.execute("CREATE TABLE state(id int PRIMARY KEY, name VARCHAR(20), elections json, demographic json, geometry json)")

states = ["OH", "NJ", "MS"]  # oh = 1 nj = 2 ms = 3
stateId = 1


def insertStateJson(paths):
    dict = {}
    for x in range(0, 3):
        with open(paths[x], 'r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for line in csv_reader:
                dict.update(line)
        input = ((json.dumps(dict)), x + 1)
        mycursor.execute(
            """UPDATE state SET demographic = %s WHERE id = %s""", input)
        dict = {}


def insertStateGeoJson(paths):
    for x in range(0, 3):
        f = open(paths[x])
        data = json.load(f)
        del data['type']
        del data['properties']
        input = ((json.dumps(data['geometry'])), x + 1)
        mycursor.execute(
            """UPDATE state SET geometry = %s WHERE id = %s""", input)



# insert states
for x in states:
    mycursor.execute("INSERT INTO state(name,id) VALUES(%s,%s)", (x, stateId))
    stateId += 1


insertStateJson(statDemoPaths)
insertStateGeoJson(stateGeoPaths)

db.commit()
db.close()
