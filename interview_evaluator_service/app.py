import gradio as gr
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import json
import re
import os
import spaces

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
print(f"Loading {MODEL_NAME}...")

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

# ZeroGPU accelerated evaluation
@spaces.GPU
def run_evaluation(question_content: str, answer_content: str, concepts: list[str], criteria: list[str]):
    system_prompt = (
        "You are an expert technical interviewer evaluating a candidate's answer. "
        "You must respond ONLY with a valid JSON object. Do not include markdown tags like ```json. "
        "The JSON must have this exact structure: "
        '{"score": 8.5, "feedback": "Good explanation...", "missingConcepts": ["concept1"]}'
    )
    
    concepts_str = ', '.join(concepts) if concepts else 'General Technical Principles'
    criteria_str = ', '.join(criteria) if criteria else 'Clarity, Correctness, Depth'
    
    user_prompt = f"""
    Question: {question_content}
    Expected Concepts: {concepts_str}
    Grading Criteria: {criteria_str}
    
    Candidate Answer: {answer_content}
    
    Evaluate the candidate's answer based on the concepts and criteria. Provide a score from 0.0 to 10.0.
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=256,
        temperature=0.2
    )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    try:
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
        return {
            "score": 5.0,
            "feedback": f"Raw evaluation: {response}",
            "missingConcepts": []
        }

# ----------------- Gradio UI -----------------
def gradio_evaluate(question, answer, concepts_text, criteria_text):
    concepts = [c.strip() for c in concepts_text.split(",") if c.strip()]
    criteria = [cr.strip() for cr in criteria_text.split(",") if cr.strip()]
    res = run_evaluation(question, answer, concepts, criteria)
    missing = ", ".join(res.get("missingConcepts", [])) or "None"
    return f"🎯 Score: {res['score']}/10.0\n\n❌ Missing Concepts: {missing}\n\n💡 Feedback:\n{res['feedback']}"

with gr.Blocks(title="HireCraft Interview Evaluator") as demo:
    gr.Markdown("# 🎙️ HireCraft AI - Technical & Voice Interview Evaluator")
    gr.Markdown("Powered by `Qwen/Qwen2.5-0.5B-Instruct` running on **Hugging Face ZeroGPU (NVIDIA A10G)**. Evaluates spoken or typed technical answers against concept rubrics (REST endpoint: `/evaluate`).")
    with gr.Row():
        with gr.Column():
            q_in = gr.Textbox(label="Interview Question", lines=2, value="What is the difference between TCP and UDP?")
            a_in = gr.Textbox(label="Candidate Answer", lines=4, placeholder="Type or paste candidate answer...")
            c_in = gr.Textbox(label="Expected Concepts (comma-separated)", value="handshake, connection-oriented, reliability, header size")
            cr_in = gr.Textbox(label="Grading Criteria (comma-separated)", value="Technical accuracy, completeness")
            eval_btn = gr.Button("Evaluate Answer", variant="primary")
        with gr.Column():
            out = gr.Textbox(label="AI Rubric Evaluation Scorecard", lines=10)
            
    eval_btn.click(gradio_evaluate, inputs=[q_in, a_in, c_in, cr_in], outputs=[out])

# ----------------- Attach FastAPI Routes -----------------
app = demo.app

@app.post("/evaluate")
async def evaluate_answer(req: EvaluationRequest):
    question = req.get_question()
    answer = req.get_answer()
    return run_evaluation(question, answer, req.concepts, req.criteria)

if __name__ == "__main__":
    demo.launch()
