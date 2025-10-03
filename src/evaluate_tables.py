import pandas as pd
import asyncio
from src.utils.maps import get_distance_or_duration, log_google_maps_usage

def convert_to_df(path):
    if path.endswith('.csv'):
        return pd.read_csv(path)
    try:
        return pd.read_excel(path)
    except:
        raise ValueError("Unsupported file format. Please provide a CSV or Excel file.")


async def evaluate_table(path, find_travel_time=False, travel_weight=0.35, employer_address=None, candidate_address_column=None, google_api_key=None, metrics=None):
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

        # Fetches travel times asynchronously:
        async def fetch_travel_time(candidate_address):
            try:
                return await get_distance_or_duration(candidate_address, employer_address, api_key=google_api_key)
            except:
                return None

        travel_times = await asyncio.gather(*[fetch_travel_time(addr) for addr in df[candidate_address_column]])
        # log_google_maps_usage(len(df[candidate_address_column]))

        df['Travel Time (mins)'] = travel_times
        df = df.sort_values(by='Travel Time (mins)')

    # Produce an overall score if requested:
    if metrics:       
        weighted_sum = sum(df[col] * weight for col, weight in metrics.items())
        min_score = weighted_sum.min()
        max_score = weighted_sum.max()
        
        # Creates a relative overall score out of 100:
        if find_travel_time:
                travel_normalised = 1 - (df['Travel Time (mins)'].clip(0, 120) / 120)
                # By default, the travel_score contributes 35% to the 'Overall Score':
                travel_score = travel_normalised * max_score * travel_weight
                weighted_sum += travel_score
                min_score = weighted_sum.min()
                max_score = weighted_sum.max()
        df['Overall Score'] = ((weighted_sum - min_score) / (max_score - min_score) * 100).round()
        df = df.sort_values(by='Overall Score', ascending=False)
        
    return df.to_json(orient='records', indent=4)