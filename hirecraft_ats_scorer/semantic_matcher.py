import torch
from transformers import AutoTokenizer, AutoModel
import torch.nn.functional as F

print("Loading the AI Model...")
# We use the core transformers library directly to bypass the bug
tokenizer = AutoTokenizer.from_pretrained("0xnbk/nbk-ats-semantic-v1-en")
model = AutoModel.from_pretrained("0xnbk/nbk-ats-semantic-v1-en")

def mean_pooling(model_output, attention_mask):
    """Mathematical function to average out the word vectors into a sentence vector"""
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def calculate_semantic_score(resume_text, job_description):
    """Calculates semantic similarity between Resume and JD"""
    print("Calculating semantic match...")
    
    # 1. Convert text to tokens (numbers the AI understands)
    encoded_input = tokenizer([resume_text, job_description], padding=True, truncation=True, return_tensors='pt')

    # 2. Run the AI model
    with torch.no_grad():
        model_output = model(**encoded_input)

    # 3. Perform Pooling and Normalization
    embeddings = mean_pooling(model_output, encoded_input['attention_mask'])
    embeddings = F.normalize(embeddings, p=2, dim=1)
    
    # 4. Calculate Cosine Similarity between the two vectors
    similarity_score = F.cosine_similarity(embeddings[0].unsqueeze(0), embeddings[1].unsqueeze(0))
    
    return similarity_score.item()

# --- Let's test the AI! ---
if __name__ == "__main__":
    
    sample_resume = "I am a server-side programmer. I build APIs and manage databases."
    sample_jd = "Looking for a backend developer with experience in creating web services."
    
    semantic_score = calculate_semantic_score(sample_resume, sample_jd)
    
    print("\n--- SEMANTIC AI MATCH RESULT ---")
    print(f"Resume: {sample_resume}")
    print(f"Job Desc: {sample_jd}")
    print(f"Similarity Score: {semantic_score * 100:.2f}%")
