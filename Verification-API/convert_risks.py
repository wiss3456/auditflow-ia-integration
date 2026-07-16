import pandas as pd
import json

def convert_excel_to_risk_table(file_path: str, mission_name: str):
    df = pd.read_excel(file_path , header=1)
    df = df.ffill()
    print(df[["Objet auditable", "Sous-objet auditable", "Risque"]].head(20))
    risks = []
    print(df.columns.tolist())
    for _, row in df.iterrows():

        objet = str(row["Objet auditable"]).strip()

        risque = row["Risque"]

        bonnes_pratiques = str(row["Bonnes pratiques"]).strip()

        if pd.isna(risque):
            continue

        risque = str(risque).strip()

        risk_entry = {
            "objet": objet,
            "risque": risque,
            "bonnes_pratiques": bonnes_pratiques
        }

        risks.append(risk_entry)
        
    return {
        "mission": mission_name,
        "total_risques": len(risks),
        "risks": risks
    }


# Conversion des deux fichiers
risk_reclamations = convert_excel_to_risk_table(
    "TaRi Réclamations clients.xlsx", 
    "Audit du processus de traitement des réclamations clients"
)



# Sauvegarde
with open("risk_reclamations.json", "w", encoding="utf-8") as f:
    json.dump(risk_reclamations, f, ensure_ascii=False, indent=2)



print("✅ Conversion terminée avec succès !")
print(f"Réclamations clients : {len(risk_reclamations['risks'])} risques")
