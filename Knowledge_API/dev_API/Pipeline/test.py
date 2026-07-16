from pathlib import Path 


print(Path(__file__).resolve())
print(Path(__file__).resolve().parent)
print(Path(__file__).resolve().parent / "cache/M01/test.json")
print(Path(__file__).resolve().parent.parent / "cache/M01/test.json")


path = Path(__file__).resolve().parent.parent / "cache/M01/test.json" 

path.parent.mkdir(parents=True,exist_ok=True)
