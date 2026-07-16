import yaml
import json
import re
from pathlib import Path
from groq import Groq
from app.config import settings


class VerificationGenerator:

    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.prompt_template = self._load_prompt()

    def _load_prompt(self):

        base_dir = Path(__file__).resolve().parent.parent

        prompt_path = (
            base_dir / "prompts" / "generate_verification.yaml"
        )

        if not prompt_path.exists():
            raise FileNotFoundError(
                f"Prompt file not found: {prompt_path}"
            )

        with open(prompt_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def _clean_json(self, text: str) -> str:

        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)

        text = text.strip()

        if '{' in text:
            start = text.find('{')
            text = text[start:]

        return text

    async def generate(self, mission_id: str, risk_table: dict):

        risks_list = risk_table.get("risks", [])

        print("Nombre de risques :", len(risks_list))

        all_tasks = []

        for risk in risks_list:

            single_risk_json = json.dumps(
                risk,
                ensure_ascii=False,
                indent=2
            )

            user_prompt = self.prompt_template["user"].format(
                mission_id=mission_id,
                risk_table=single_risk_json
            )

            completion = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": self.prompt_template["system"]
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                temperature=0.2,
                max_tokens=300,
                response_format={"type": "json_object"},
            )

            content = completion.choices[0].message.content.strip()

            print("\n===== RAW RESPONSE =====\n")
            print(content)

            cleaned = self._clean_json(content)

            try:
                result = json.loads(cleaned)

            except json.JSONDecodeError:
                print("JSON invalide")
                continue

            # récupérer une seule tâche
            if isinstance(result, dict):

                if "tasks" in result:

                    tasks = result["tasks"][:1]

                elif "risques" in result:

                    tasks = result["risques"][:1]

                else:

                    tasks = [result]

            else:
                tasks = []
            for task in tasks:

                if isinstance(task, dict):

                    task["risque"] = risk.get(
                        "risque",
                        ""
                    )

                    task["mission_id"] = mission_id

                    all_tasks.append(task)

        print("\n===== TOTAL TASKS =====\n")
        print(len(all_tasks))

        unique_tasks = []
        seen = set()

        for task in all_tasks:

            key = (
                task.get("risque", "").strip().lower(),
                task.get("tache", "").strip().lower()
            )

            if key not in seen:

                seen.add(key)

                unique_tasks.append(task)

        print("\n===== UNIQUE TASKS =====\n")
        print(len(unique_tasks))

        return unique_tasks