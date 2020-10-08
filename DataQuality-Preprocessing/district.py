import mysql.connector
import csv, json
import os
import geopandas as gp

db = mysql.connector.connect(
    host="mysql3.cs.stonybrook.edu", user="hanliu2", passwd="111455416", db="hanliu2"
    #host='mysql3.cs.stonybrook.edu', user = 'runjiang', password="110998233", database = 'runjiang'
)



mycursor = db.cursor()
#mycursor.execute("DROP TABLE district")
#mycursor.execute("DROP TABLE state")

demoDir = os.path.join(os.path.dirname(__file__), "2010Demo")
disGeoDir = os.path.join(os.path.dirname(__file__), "cd")
distDemoPaths = [os.path.join(demoDir, 'OH2010BYDISTRICT.csv'), os.path.join(
    demoDir, 'NJ2010BYDISTRICT.csv'), os.path.join(demoDir, 'MS2010BYDISTRICT.csv')]
distGeoPaths = [os.path.join(disGeoDir,'OH.geojson'),os.path.join(disGeoDir,'NJ.geojson'),os.path.join(disGeoDir,'MS.geojson')]

mycursor.execute("CREATE TABLE district(id int PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30), state_id int, elections json, demographic json, geometry json, precincts json)")
states = ["OH", "NJ", "MS"]  # oh = 1 nj = 2 ms = 3
disNum = [16, 12, 4] # oh = 16 nj = 12 ms = 4


def insertDistrict(stateId, distNum):
    for x in range(0, distNum):
        mycursor.execute("INSERT INTO District(name,state_id) VALUES(%s,%s)",
                         (states[stateId-1]+"-"+str(x+1), stateId))


def insertDistrictJson(paths):
    #dict = {}
    distCount = 1
    for x in range(0, 3):
        with open(paths[x], 'r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for line in csv_reader:
                input = ((json.dumps(line)), distCount)
                mycursor.execute(
                    """UPDATE district SET demographic = %s WHERE id = %s""", input)
                distCount += 1


def insertDistrictGeoJson(paths):
    distCount = 1
    for x in range(0, 3):
        data = gp.read_file(paths[x])
        data['geojson'] = None
        for index, row in data.iterrows():
            data.at[index,"geojson"] = row.geometry.__geo_interface__
        for index, row in data.iterrows():
            input = ((json.dumps(row.geojson)), distCount)
            mycursor.execute(
                """UPDATE district SET geometry = %s WHERE id = %s""", input)
            distCount+=1


# insert districts
for x in range(0, 3):
    insertDistrict(x+1,disNum[x])

insertDistrictJson(distDemoPaths)
insertDistrictGeoJson(distGeoPaths)


db.commit()
db.close()