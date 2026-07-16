import pandas as pd

file_path = "TaRi Réclamations clients.xlsx"

df = pd.read_excel(file_path)

print(df)

print("\nNombre de lignes :", len(df))
print("\nColonnes :", df.columns.tolist())