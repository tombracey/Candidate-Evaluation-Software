import pandas as pd
from src.GCP_utils.maps import get_distance_or_duration, log_google_maps_usage

def convert_to_df(path):
    if path.endswith('.csv'):
        return pd.read_csv(path)

    
def evaluate_table(path, find_travel_time=False, travel_weight=0.35, employer_address=None, candidate_address_column=None, **metrics):
    """Takes a df and optional metrics
    User can check for candidates' travel time and/or the travel 
     outputs an overall score or just the travel time"""
    df = convert_to_df(path)

    if metrics:
        # checking for missing columns before making any API requests
        missing_columns = [col for col in metrics if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Could not locate column/s: {missing_columns}")

    # Find travel times if requested:
    if find_travel_time:
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
        requests = 0
        for candidate_address in df[candidate_address_column]:
            requests += 1
            try:
                travel_time = get_distance_or_duration(candidate_address, employer_address)
                travel_times.append(travel_time)
            except:
                travel_times.append(None)
        log_google_maps_usage(requests)

        df['Travel Time (mins)'] = travel_times
        df = df.sort_values(by='Travel Time (mins)')

    # Produce an overall score if requested:
    if metrics:       
        weighted_sum = sum(df[col] * weight for col, weight in metrics.items())
        min_score = weighted_sum.min()
        max_score = weighted_sum.max()
        
        # Creates a relative overall score out of 100:
        if find_travel_time:
                travel_normalized = 1 - (df['Travel Time (mins)'].clip(0, 120) / 120)
                # By default, the travel_score contributes 35% to the 'Overall Score':
                travel_score = travel_normalized * (max_score * travel_weight)            
                weighted_sum += travel_score
                min_score = weighted_sum.min()
                max_score = weighted_sum.max()
        df['Overall Score'] = ((weighted_sum - min_score) / (max_score - min_score) * 100).round()
        df = df.sort_values(by='Overall Score', ascending=False)
        
    df.to_markdown('./data/output/spreadsheet_evaluation.md', index=False)
    return df.to_json(orient='records', indent=4)


evaluate_table('./data/mock_candidates.csv', True, employer_address='10 Downing Street', Experience=1, Qualifications=1)