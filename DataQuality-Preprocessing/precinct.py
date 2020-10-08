import MySQLdb
from shapely.geometry import Polygon
from shapely.geometry import MultiPolygon
import csv
import math
import copy

db=MySQLdb.connect(host="mysql3.cs.stonybrook.edu", user="hanliu2", passwd="111455416", db="hanliu2")
db.autocommit(True)

c=db.cursor()

c.execute(
    """
    CREATE TABLE precinct (
        id int unsigned AUTO_INCREMENT PRIMARY KEY,
        name varchar(100),
        canonicalName varchar(100),
        elections json,
        demographics json,
        geometry json,
        originalGeometry json,
        stateName char(2),
        districtName char(5),
        neighbors varchar(255)
    )
    """
)

c.execute(
    """
    CREATE TABLE error (
        id int unsigned AUTO_INCREMENT PRIMARY KEY,
        category int
    )
    """
)

c.execute(
    """
    CREATE TABLE precinct_error (
        precinct_id int unsigned NOT NULL,
        error_id int unsigned NOT NULL,
        FOREIGN KEY (precinct_id) REFERENCES precinct(id),
        FOREIGN KEY (error_id) REFERENCES error(id)
    )
    """
)

import geopandas as gp
import json

states = ['MS', 'NJ', 'OH']
countyFPs = [{'001': 'Adams', '003': 'Alcorn', '005': 'Amite', '007': 'Attala', '009': 'Benton', '011': 'Bolivar', '013': 'Calhoun', '015': 'Carroll', '017': 'Chickasaw', '019': 'Choctaw', '021': 'Claiborne', '023': 'Clarke', '025': 'Clay', '027': 'Coahoma', '029': 'Copiah', '031': 'Covington', '033': 'De Soto', '035': 'Forrest', '037': 'Franklin', '039': 'George', '041': 'Greene', '043': 'Grenada', '045': 'Hancock', '047': 'Harrison', '049': 'Hinds', '051': 'Holmes', '053': 'Humphreys', '055': 'Issaquena', '057': 'Itawamba', '059': 'Jackson', '061': 'Jasper', '063': 'Jefferson', '065': 'Jefferson Davis', '067': 'Jones', '069': 'Kemper', '071': 'Lafayette', '073': 'Lamar', '075': 'Lauderdale', '077': 'Lawrence', '079': 'Leake', '081': 'Lee', '083': 'Leflore', '085': 'Lincoln', '087': 'Lowndes', '089': 'Madison', '091': 'Marion', '093': 'Marshall', '095': 'Monroe', '097': 'Montgomery', '099': 'Neshoba', '101': 'Newton', '103': 'Noxubee', '105': 'Oktibbeha', '107': 'Panola', '109': 'Pearl River', '111': 'Perry', '113': 'Pike', '115': 'Pontotoc', '117': 'Prentiss', '119': 'Quitman', '121': 'Rankin', '123': 'Scott', '125': 'Sharkey', '127': 'Simpson', '129': 'Smith', '131': 'Stone', '133': 'Sunflower', '135': 'Tallahatchie', '137': 'Tate', '139': 'Tippah', '141': 'Tishomingo', '143': 'Tunica', '145': 'Union', '147': 'Walthall', '149': 'Warren', '151': 'Washington', '153': 'Wayne', '155': 'Webster', '157': 'Wilkinson', '159': 'Winston', '161': 'Yalobusha', '163': 'Yazoo'},
    {'001': 'Atlantic', '003': 'Bergen', '005': 'Burlington', '007': 'Camden', '009': 'Cape May', '011': 'Cumberland', '013': 'Essex', '015': 'Gloucester', '017': 'Hudson', '019': 'Hunterdon', '021': 'Mercer', '023': 'Middlesex', '025': 'Monmouth', '027': 'Morris', '029': 'Ocean', '031': 'Passaic', '033': 'Salem', '035': 'Somerset', '037': 'Sussex', '039': 'Union', '041': 'Warren'},
    {'001': 'Adams', '003': 'Allen', '005': 'Ashland', '007': 'Ashtabula', '009': 'Athens', '011': 'Auglaize', '013': 'Belmont', '015': 'Brown', '017': 'Butler', '019': 'Carroll', '021': 'Champaign', '023': 'Clark', '025': 'Clermont', '027': 'Clinton', '029': 'Columbiana', '031': 'Coshocton', '033': 'Crawford', '035': 'Cuyahoga', '037': 'Darke', '039': 'Defiance', '041': 'Delaware', '043': 'Erie', '045': 'Fairfield', '047': 'Fayette', '049': 'Franklin', '051': 'Fulton', '053': 'Gallia', '055': 'Geauga', '057': 'Greene', '059': 'Guernsey', '061': 'Hamilton', '063': 'Hancock', '065': 'Hardin', '067': 'Harrison', '069': 'Henry', '071': 'Highland', '073': 'Hocking', '075': 'Holmes', '077': 'Huron', '079': 'Jackson', '081': 'Jefferson', '083': 'Knox', '085': 'Lake', '087': 'Lawrence', '089': 'Licking', '091': 'Logan', '093': 'Lorain', '095': 'Lucas', '097': 'Madison', '099': 'Mahoning', '101': 'Marion', '103': 'Medina', '105': 'Meigs', '107': 'Mercer', '109': 'Miami', '111': 'Monroe', '113': 'Montgomery', '115': 'Morgan', '117': 'Morrow', '119': 'Muskingum', '121': 'Noble', '123': 'Ottawa', '125': 'Paulding', '127': 'Perry', '129': 'Pickaway', '131': 'Pike', '133': 'Portage', '135': 'Preble', '137': 'Putnam', '139': 'Richland', '141': 'Ross', '143': 'Sandusky', '145': 'Scioto', '147': 'Seneca', '149': 'Shelby', '151': 'Stark', '153': 'Summit', '155': 'Trumbull', '157': 'Tuscarawas', '159': 'Union', '161': 'VanWert', '163': 'Vinton', '165': 'Warren', '167': 'Washington', '169': 'Wayne', '171': 'Williams', '173': 'Wood', '175': 'Wyandot'}]
sql = "INSERT INTO `precinct` (`id`, `name`, `canonicalName`, `geometry`, `originalGeometry`, `stateName`, `districtName`, `neighbors`, 'demographic') VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s)"
precinctId = 1

c = 0

for i in range(3):
    pfile = "./precinct/" + states[i] + ".geojson"
    cdfile = "./cd/" + states[i] + ".geojson"
    # Get county list
    csvfile = './2010Demo/'+ states[i] + '2010BYCOUNTY.csv'
    counties = []
    with open(csvfile,'r') as csv_file:
        csv_reader = csv.reader(csv_file)
        next(csv_file)
        for line in csv_reader:
            counties.append(line[1].split(',')[0])

    df = gp.read_file(pfile)
    df = df.to_crs({'init': 'epsg:3174'})
    cddf = gp.read_file(cdfile)

    df['precinctId'] = None
    df["pname"] = None
    df["geojson"] = None
    df["county"] = None
    df["stateName"] = None
    df['districtName'] = None
    df['canonicalName'] = None
    df["neighbors"] = None
    df['demographic'] = None
    prevDistrict = None
    for index, row in df.iterrows():
        df.at[index, 'precinctId'] = precinctId
        precinctId += 1

        # Set precinct name
        name = row['NAME10']
        if name.isdigit() and i == 0:
            name = row.PRECINCT
        name = name.title()
        name = name.replace('Precinct', '')
        name = ' '.join(name.split())
        df.at[index, "pname"] = name

        # Set precinct geojson
        df.at[index, "geojson"] = row.geometry.__geo_interface__

        # Set precinct county
        countyName = row['COUNTYFP10']
        countyName = countyFPs[i][countyName]
        countyName = countyName.title()
        countyName += " County"

        df.at[index, "county"] = countyName


        # Set precinct state name
        df.at[index,'stateName'] = states[i]

        # Set district name
        district = None
        district = cddf[cddf.geometry.contains(row['geometry'])]
        codes = district.Code.tolist()
        if not codes:
            district = prevDistrict
        else:
            district = codes[0]
        prevDistrict = district

        df.at[index, "districtName"] = district

        # Set canonical name
        canonicalName = district + " " + row['NAME10']

        df.at[index, "canonicalName"] = canonicalName
        c+=1
        if c==10:
            break
    
#     for index, row in df.iterrows():
#         # Set precinct neighbors
#         neighborRows = df[df.geometry.touches(row['geometry'])]
#         neighbors = neighborRows.precinctId.tolist()
#         for index1, neighbor in neighborRows.iterrows():
#             intersection = (row.geometry.intersection(neighbor.geometry))
#             if intersection.length * 3.28084 < 200:
#                 neighbors.remove(neighbor.precinctId)
#         s = [str(n) for n in neighbors] 
#         df.at[index, "neighbors"] = ", ".join(s)

        
#         # 0. Check enclosed precincts (the one that is in a hole)
#         if row.geometry.geom_type=='Polygon':
#             p = row.geometry.interiors
#             if p:
#                 for j in p:
#                     x = df[df.geometry.intersects(Polygon(j))]
#                     z = x.name.tolist()
#                     z.remove(row.name)
#                     errors.append({"precinct_id": z[0], "category": 0})


#         # 1. Check overlapping precincts
#         # There is no overlapping precincts!!! Make up one?
#         p = df[df.geometry.overlaps(row.geometry)]
#         if not p.empty:
#               errors.append({"precinct_id": z[0], "category": 1})

#         # 2. check for gaps and any uncovered area by union all the precincts
#         p = df.geometry.unary_union
#         new = gp.GeoDataFrame(crs=df.crs, geometry=[p])
#         for index, row in new.iterrows():
#             geo = None
#             if row.geometry.geom_type=='MultiPolygon':
#                 geo = max(row.geometry, key=lambda a: a.area)
#             else:
#                 geo = row.geometry
#             interior = geo.interiors
#             for k in interior:
#                 x = Polygon(k)
#                 y = df[df.geometry.intersects(x)]
#                 if len(y) == 1:
#                     for index2, row2 in y.iterrows():
#                         newIndex = len(df)
#                         df.loc[newIndex, 'precinctId'] = precinctId
#                         df.at[newIndex, 'pname'] = 'Enclosed Precinct'
#                         df.at[newIndex, 'geojson'] = x.__geo_interface__
#                         df.at[newIndex, 'geometry'] = x
#                         df.at[newIndex, 'county'] = row2.county
#                         df.at[newIndex, 'stateName'] = row2.stateName
#                         df.at[newIndex, 'districtName'] = row2.districtName
#                         df.at[newIndex, 'canonicalName'] = row2.districtName + 'Enclosed Precinct'
#                         df.at[newIndex, 'neighbors'] = str(row2.precinctId)
#                         errors.append({"precinct_id": precinctId, "category":0})                           
#                         errors.append({"precinct_id": precinctId, "category": 2})
#                         precinctId = precinctId + 1
#                 else:
#                     errors.append({"precinct_id": precinctId, "category":3})                           
        
#                 # merge the interior for next step's error
#                 for k in interior:
#                     p = p.union(Polygon(k))
        
#         # 3. Check for ghost precincts by checking difference between state boundary and union precinct boundary


#         # 2. Check for multi polygon
 
#     csvfile = './2010Demo/'+ states[i] + '2010BYCOUNTY.csv'
#     with open(csvfile,'r') as csv_file:
#         csv_reader = csv.DictReader(csv_file)
#         for line in csv_reader:
#             countyName = line['Geographic Area Name'].split(',')[0]
#             del line['Geographic Area Name']
#             pdf = df[df.county==countyName]
#             union = pdf.unary_union
            
#             totalArea = union.area
            
            
#             for index, row in pdf.iterrows():
#                 area = row['geometry'].area
#                 percent = area/totalArea
#                 line2 = copy.deepcopy(line)
#                 print(line)
#                 print(percent)
#                 for key in range(6):
#                     line2[str(key)] = str(int(math.floor(int(line[str(key)])*percent)))
#                 row.demographic = line2
               
                
 
#     for index, row in df.iterrows():
#         c.execute(sql, (str(row.precinctId), row.pname, row.canonicalName, json.dumps(row.geojson), json.dumps(row.geojson), row.stateName, row.districtName, row.neighbors, row.demographic))

db.close()