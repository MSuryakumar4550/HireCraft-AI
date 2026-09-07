from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import json
import re
import os

app = FastAPI(title="Local Hugging Face Evaluator")

# Using a highly capable but very small model (0.5B parameters) to run easily on CPU without crashing.
# If you have an NVIDIA GPU and 16GB+ RAM, change this to "meta-llama/Meta-Llama-3-8B-Instruct"
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

print(f"Loading {MODEL_NAME} (this will take a few minutes to download the first time)...")

# Force CPU if no CUDA to avoid driver errors, otherwise auto
device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME, 
    device_map=device
)

class EvaluationRequest(BaseModel):
    questionText: str = ""
    question_text: str = ""
    candidateAnswer: str = ""
    candidate_answer: str = ""
    concepts: list[str] = []
    criteria: list[str] = []

    def get_question(self) -> str:
        return self.questionText or self.question_text or ""

    def get_answer(self) -> str:
        return self.candidateAnswer or self.candidate_answer or ""

@app.post("/evaluate")
async def evaluate_answer(req: EvaluationRequest):
    question_content = req.get_question()
    answer_content = req.get_answer()

    # Construct the strict system prompt for JSON output
    system_prompt = (
        "You are an expert technical interviewer evaluating a candidate's answer. "
        "You must respond ONLY with a valid JSON object. Do not include markdown tags like ```json. "
        "The JSON must have this exact structure: "
        '{"score": 8.5, "feedback": "Good explanation...", "missingConcepts": ["concept1"]}'
    )
    
    user_prompt = f"""
    Question: {question_content}
    Expected Concepts: {', '.join(req.concepts)}
    Grading Criteria: {', '.join(req.criteria)}
    
    Candidate Answer: {answer_content}
    
    Evaluate the candidate's answer based on the concepts and criteria. Provide a score from 0.0 to 10.0.
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    print("Evaluating answer...")
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=256,
        temperature=0.2 # low temp for deterministic grading
    )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    print(f"Raw Model Output:\n{response}")
    
    # Try to parse the JSON output safely
    try:
        # Extract json between brackets if the model added extra text
        match = re.search(r'\{.*\}', response.replace('\n', ''), re.DOTALL)
        if match:
            json_str = match.group(0)
            result = json.loads(json_str)
            return {
                "score": float(result.get("score", 5.0)),
                "feedback": result.get("feedback", "No feedback provided."),
                "missingConcepts": result.get("missingConcepts", [])
            }
        else:
            raise ValueError("No JSON brackets found")
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        # Graceful fallback if model hallucinates non-JSON
        return {
            "score": 5.0,
            "feedback": f"Could not parse model output. Raw output: {response}",
            "missingConcepts": []
        }

if __name__ == "__main__":
    print("Starting Hugging Face Evaluator on http://localhost:8002")
    uvicorn.run(app, host="127.0.0.1", port=8002)
