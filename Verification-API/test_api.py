import requests
import json

with open("risk_reclamations.json", "r", encoding="utf-8") as f:
    risk_table = json.load(f)

payload = {
    "mission_id": "MISSION-RECLAM-2026-001",
    "final_risk_table": risk_table
}

response = requests.post(
    "http://127.0.0.1:8002/api/v1/verification/generate",
    json=payload
)

print("Status Code:", response.status_code)

data = response.json()

print("\nProgramme généré :\n")

# إذا API رجعات tasks
if isinstance(data, dict) and "tasks" in data:
    tasks = data["tasks"]

# إذا رجعات list مباشرة
elif isinstance(data, list):
    tasks = data

else:
    tasks = []

for task in tasks:

    if isinstance(task, dict):

        print(f"Risque      : {task.get('risque', '')}")
        print(f"Tâche       : {task.get('tache', '')}")
        print(f"Objectif    : {task.get('objectif', '')}")
        print(f"Méthodologie: {task.get('methodologie', '')}")
        print("-" * 80)