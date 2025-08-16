import requests
import os
from datetime import datetime, timedelta, time
from dotenv import load_dotenv

def get_distance_or_duration(origin: str, destination: str, mode: str = "transit", info_type: str = "duration"):
    """
    Args:
        origin
        destination
        mode: "driving", "walking", "bicycling" or "transit"
        info_type: "distance" or "duration".
    """
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("API key not set.")
    base_url = "https://maps.googleapis.com/maps/api/distancematrix/json?"

    now = datetime.now()
    tomorrow = now + timedelta(days=1)
    eight_am_tomorrow = datetime.combine(tomorrow.date(), time(8, 0)) # realistic commuting time
    departure_timestamp = int(eight_am_tomorrow.timestamp())

    params = {
        "origins": origin,
        "destinations": destination,
        "mode": mode,
        "key": api_key,
        "departure_time": departure_timestamp
    }

    response = requests.get(base_url, params=params)
    data = response.json()

    element = data["rows"][0]["elements"][0]

    if info_type == "distance":
        return f"{round(element["distance"]["value"]/1000)} km"
    elif info_type == "duration":
        return round(element["duration"]["value"]/60)