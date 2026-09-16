import torch
from transformers import AutoTokenizer, AutoModel
import torch.nn.functional as F

MODEL_NAME = "0xnbk/nbk-ats-semantic-v1-en"

tokenizer = None
model = None


def load_model():
    global tokenizer, model

    if tokenizer is None or model is None:
        print("Loading the AI Model...")

        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModel.from_pretrained(MODEL_NAME)

        model.eval()

        print("AI Model loaded successfully.")


def mean_pooling(model_output, attention_mask):
    """Average token embeddings into a sentence embedding."""
    token_embeddings = model_output[0]

    input_mask_expanded = (
        attention_mask
        .unsqueeze(-1)
        .expand(token_embeddings.size())
        .float()
    )

    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(
        input_mask_expanded.sum(1),
        min=1e-9
    )


def calculate_semantic_score(resume_text, job_description):
    """Calculate semantic similarity between resume and job description."""

    print("Calculating semantic match...")

    # Load the model only when semantic scoring is actually requested
    load_model()

    encoded_input = tokenizer(
        [resume_text, job_description],
        padding=True,
        truncation=True,
        max_length=256,
        return_tensors="pt"
    )

    with torch.no_grad():
        model_output = model(**encoded_input)

    embeddings = mean_pooling(
        model_output,
        encoded_input["attention_mask"]
    )

    embeddings = F.normalize(embeddings, p=2, dim=1)

    similarity_score = F.cosine_similarity(
        embeddings[0].unsqueeze(0),
        embeddings[1].unsqueeze(0)
    )

    return similarity_score.item()


if __name__ == "__main__":

    sample_resume = (
        "I am a server-side programmer. "
        "I build APIs and manage databases."
    )

    sample_jd = (
        "Looking for a backend developer "
        "with experience in creating web services."
    )

    semantic_score = calculate_semantic_score(
        sample_resume,
        sample_jd
    )

    print("\n--- SEMANTIC AI MATCH RESULT ---")
    print(f"Resume: {sample_resume}")
    print(f"Job Desc: {sample_jd}")
    print(f"Similarity Score: {semantic_score * 100:.2f}%")