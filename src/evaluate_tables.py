import pandas as pd
# from src.conversions.sql import sql_to_df
from src.GCP_utils.maps import get_distance_or_duration

def convert_to_df(path):
    if path.endswith('.csv'):
        return pd.read_csv(path)
    
    # need to add sql, other spreadsheets

# Takes a df, and optional metrics, outputs travel time/overall score
def evaluate_table(path, employer_address, candidate_address_column=None, **metrics):
    df = convert_to_df(path)

    if not candidate_address_column:
        # tries to find addresses if the column isn't specified
        likely_column_names = ["postcode", "post code", "address"]
        for column in df.columns:
            if column.lower() in likely_column_names:
                candidate_address_column = column
                break

    if not candidate_address_column:
        raise ValueError("Please specify the address column.")

    travel_times = []
    for candidate_address in df[candidate_address_column]:
        try:
           travel_time = get_distance_or_duration(candidate_address, employer_address)
           travel_times.append(travel_time)
        except:
            travel_times.append(None)

    df['Travel Time (mins)'] = travel_times
    
    df.to_markdown('./data/output/spreadsheet_evaluation.md', index=False)
    return df

evaluate_table('./data/mock_candidates.csv', '10 Downing Street')