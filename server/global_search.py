import sys
import json
import pandas as pd
from sqlalchemy import create_engine
import urllib.parse

# --- CONFIGURATION ---
DB_SERVER = r"ARUN_SHARMA\SQLEXPRESS01"
DB_NAME = "NDA_Stag"

# Mapping Modules to Table Identification (Prefixes or Name patterns)
# Based on your logic: "Preadmission" -> PREADMISSON_DB (which implies tables related to preadmission)
# I will use the PREFIXES approach which is robust for SQL tables.

MODULE_MAPPING = {
    "Preadmission": {
        "keywords": ["Students", "Parents", "Admission", "Admin", "Office", "Faculty", "Interview Panel", "Finance Team", "Management", "Head of Institution"],
        "prefix": "Preadmission_" 
    },
    "Admission": {
        "keywords": ["Students", "Parents", "Admission Office", "Admin Staff", "Faculty", "Interview Panel", "Management", "Leadership"],
        "prefix": "Adm_" 
    },
    "Fees": {
        "keywords": ["Students", "Parents", "Fees Office", "Admin Staff", "Finance", "Accounts Teams"],
        "prefix": "Fee" 
    },
    "Exam": {
        "keywords": ["Configuration", "Master", "Exam Mapping", "Marks Entry", "Reports", "Students"],
        "prefix": "Exm_" 
    },
    "HRMS": {
        "keywords": ["Master", "Employee", "Transaction", "Reports"],
        "prefix": "HR_" 
    },
    "Inventory": {
        "keywords": ["Master", "Transaction", "Reports"],
        "prefix": "INV_" 
    }
}

# --- DATABASE CONNECTION ---
def get_db_engine():
    try:
        params = urllib.parse.quote_plus(
            "DRIVER={SQL Server};"
            f"SERVER={DB_SERVER};"
            f"DATABASE={DB_NAME};"
            "Trusted_Connection=yes;"
        )
        return create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
    except Exception as e:
        return None

# --- SMART SEARCH ---
def perform_search(query):
    engine = get_db_engine()
    if not engine:
        return {"error": "Database connection failed"}

    results = []
    query_lower = query.lower()

    # 1. IDENTIFY CONTEXT (Which Module?)
    target_modules = []
    
    # Check if query contains a module name
    
    
    for module_name in MODULE_MAPPING.keys():
        if module_name.lower() in query_lower:
            target_modules.append(module_name)
    
    # If no specific module found, search ALL modules (Global Search)
    if not target_modules:
        target_modules = list(MODULE_MAPPING.keys())

    # 2. IDENTIFY TABLES TO SEARCH
    # We fetch all tables and filter by the identified modules' prefixes
    try:
        tables_df = pd.read_sql("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'", engine)
        
        tables_to_search = []
        for module in target_modules:
            prefix = MODULE_MAPPING[module]["prefix"]
            # specific keywords in query? e.g. "Fees Students" -> Search matching tables
            # For now, just simplistic prefix matching
            module_tables = tables_df[tables_df['TABLE_NAME'].str.contains(prefix, case=False, na=False)]
            
            for _, row in module_tables.iterrows():
                tables_to_search.append(f"{row['TABLE_SCHEMA']}.[{row['TABLE_NAME']}]")
                
    except Exception as e:
        return {"error": f"Table fetch error: {str(e)}"}

    # 3. EXECUTE SEARCH
    # Limit tables search to prevent timeout. 
    # Prioritize tables that match query keywords if possible.
    
    search_count = 0
    max_tables = 15 # limit
    
    for table in tables_to_search[:max_tables]:
        try:
            # Search logic
            sql = f"SELECT TOP 10 * FROM {table}"
            df = pd.read_sql(sql, engine)
            
            # String match
            mask = df.astype(str).apply(
                lambda x: x.str.contains(query, case=False, na=False)
            ).any(axis=1)
            
            matches = df[mask]
            
            if not matches.empty:
                for _, row in matches.iterrows():
                    # Clean data
                    row_data = row.where(pd.notnull(row), None).to_dict()
                    results.append({
                        "module": next((m for m in target_modules if MODULE_MAPPING[m]["prefix"] in table), "General"),
                        "table": table,
                        "data": row_data
                    })
                    if len(results) >= 6: return results # Global limit check
                    
        except Exception:
            continue
            
    return results

# --- MAIN ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"results": []}))
        sys.exit(0)
        
    raw_input = sys.argv[1]
    data_results = perform_search(raw_input)
    
    print(json.dumps({"results": data_results}, default=str))
