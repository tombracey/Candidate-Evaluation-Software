import sqlite3
import os
import pandas as pd

def sql_to_df(db_path, table_name):
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
    return df

def csv_to_sql(path):
    # just to create a sql table for testing
    df = pd.read_csv(path)
    output_path = "./data/candidates_sql_table.db"
    conn = sqlite3.connect(output_path)
    df.to_sql("candidates_sql_table", conn, if_exists="replace", index=False)
    conn.close()

csv_to_sql('./data/mock_candidates.csv')