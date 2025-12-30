import json
import time
import random

while True:
    data = {
        "vehicle_id": "BUS_01",
        "left_distance": random.randint(20, 100),
        "right_distance": random.randint(20, 100),
        "closing_speed": round(random.uniform(0, 1.5), 2),
        "vehicle_speed": random.randint(10, 60),
        "mode": "traffic",
        "timestamp": time.time()
    }

    print(json.dumps(data))
    time.sleep(2)
