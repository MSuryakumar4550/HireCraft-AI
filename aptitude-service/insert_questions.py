import asyncio
import json
from database import engine, Base, AsyncSessionLocal
from models import Question, DifficultyLevel

data = [
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "Pointing to a photograph, a lady tells Ram, \"I am the only daughter of this lady and her son is your maternal uncle.\" How is the speaker related to Ram's father?",
    "options_json": ["Sister-in-law", "Wife", "Sister", "Mother"],
    "correct_answer": "Wife",
    "explanation_html": "The speaker is the 'only daughter' of the lady in the photograph, which means the lady in the photo is the speaker's mother.<br/>The son of the lady in the photo is the speaker's brother.<br/>According to the speaker, her brother is Ram's maternal uncle. This means the speaker is Ram's mother.<br/>Therefore, the speaker is the wife of Ram's father."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "Read the following information: A + B means A is the daughter of B; A * B means A is the son of B; A - B means A is the wife of B. If P * Q - S, how is P related to S?",
    "options_json": ["Father", "Son", "Brother", "Nephew"],
    "correct_answer": "Son",
    "explanation_html": "Let's decode the expression 'P * Q - S':<br/>P * Q -> P is the son of Q.<br/>Q - S -> Q is the wife of S.<br/>Since Q is the wife of S, S is the husband of Q and they are a married couple.<br/>Since P is the son of Q, P must also be the son of Q's husband, S.<br/>Thus, P is the son of S."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "Pointing to a man, a woman said, \"His father is the only son of my father.\" How is the woman related to the man?",
    "options_json": ["Mother", "Aunt", "Sister", "Grandmother"],
    "correct_answer": "Aunt",
    "explanation_html": "The 'only son of my father' refers to the woman's brother.<br/>The woman is saying that her brother is the father of the man.<br/>Since the man is the son of her brother, the woman is the aunt of the man."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "Introducing a girl, a boy said, \"She is the daughter of the mother of the daughter of my aunt.\" How is the girl related to the boy?",
    "options_json": ["Cousin", "Niece", "Sister", "Aunt"],
    "correct_answer": "Cousin",
    "explanation_html": "Let's break down the statement backward:<br/>'Daughter of my aunt' is the boy's cousin.<br/>'Mother of the daughter of my aunt' is the mother of his cousin, which is his aunt.<br/>'Daughter of the mother...' means the daughter of his aunt.<br/>The daughter of his aunt is his cousin. Therefore, the girl is the boy's cousin."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "A and B are brothers. E is the daughter of F. F is the wife of B. What is the relation of E to A?",
    "options_json": ["Sister", "Daughter", "Niece", "Cousin"],
    "correct_answer": "Niece",
    "explanation_html": "F is the wife of B, and E is the daughter of F. This means E is the daughter of B.<br/>A and B are brothers. Since E is the daughter of his brother B, E is the niece of A."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "Pointing to a boy, a girl says, \"He is the son of the sister of my father's brother.\" How is the boy related to the girl?",
    "options_json": ["Brother", "Cousin", "Nephew", "Uncle"],
    "correct_answer": "Cousin",
    "explanation_html": "The girl's 'father's brother' is her uncle.<br/>The 'sister of my father's brother' is the sister of her uncle, which is her aunt (her father's sister).<br/>The 'son' of her aunt is her cousin.<br/>Thus, the boy is the cousin of the girl."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "P is the brother of D. X is the sister of P. A is the brother of F. F is the daughter of D. M is the father of X. Who is the uncle of A?",
    "options_json": ["M", "D", "P", "X"],
    "correct_answer": "P",
    "explanation_html": "F is the daughter of D, and A is the brother of F. This means A is the son of D.<br/>P is the brother of D. Since P is the brother of A's parent (D), P is the uncle of A.<br/>Therefore, P is the correct answer."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "Pointing to a woman, a girl says, \"She is the mother of the only child of my father.\" How is the woman related to the girl?",
    "options_json": ["Aunt", "Mother", "Grandmother", "Sister"],
    "correct_answer": "Mother",
    "explanation_html": "The 'only child of my father' refers to the girl herself.<br/>The 'mother' of the girl herself is naturally her own mother.<br/>Therefore, the woman is the mother of the girl."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "A family has 6 members A, B, C, D, E, F. A and B are a married couple. C is the sister of A. D is the brother of E's husband. F is the grandfather of E. If B is a female and has a daughter E, how is C related to E?",
    "options_json": ["Mother", "Aunt", "Grandmother", "Sister-in-law"],
    "correct_answer": "Aunt",
    "explanation_html": "A and B are married. Since B is female, A is male (husband).<br/>E is the daughter of B, meaning E is the daughter of A and B.<br/>C is the sister of A. So, C is the sister of E's father.<br/>The sister of one's father is their aunt. Therefore, C is the aunt of E."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "If 'A * B' means A is the father of B; 'A / B' means A is the mother of B; 'A + B' means A is the brother of B; 'A - B' means A is the sister of B. Which of the following means 'P is the maternal uncle of Q'?",
    "options_json": ["P * R / Q", "P + R / Q", "P - R * Q", "P / R + Q"],
    "correct_answer": "P + R / Q",
    "explanation_html": "For P to be the maternal uncle of Q, P must be the brother of Q's mother.<br/>Let's evaluate the options:<br/>1. P * R / Q: P is the father of R, R is the mother of Q. P is the grandfather.<br/>2. P + R / Q: P is the brother of R, and R is the mother of Q. This perfectly makes P the brother of Q's mother, which is the maternal uncle.<br/>Therefore, P + R / Q is correct."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "Pointing to a girl, a man says, \"She is the daughter of the only sister of my father.\" How is the girl related to the man?",
    "options_json": ["Niece", "Sister", "Cousin", "Aunt"],
    "correct_answer": "Cousin",
    "explanation_html": "The 'only sister of my father' refers to the man's aunt.<br/>The 'daughter' of his aunt is his cousin.<br/>Thus, the girl is the cousin of the man."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "B is the brother of A, S is the sister of B, E is the brother of D, D is the daughter of A, F is the father of S. Then, the uncle of E is?",
    "options_json": ["A", "B", "F", "S"],
    "correct_answer": "B",
    "explanation_html": "D is the daughter of A, and E is the brother of D. This means E is the son of A.<br/>B is the brother of A. Since B is the brother of E's parent (A), B is the uncle of E."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "A is the father of C. But C is not his son. E is the daughter of C. F is the spouse of A. B is the brother of C. D is the son of B. G is the spouse of B. H is the father of G. Who is the grandmother of D?",
    "options_json": ["A", "C", "F", "H"],
    "correct_answer": "F",
    "explanation_html": "A is the father of C, but C is not a son, so C is A's daughter.<br/>B is the brother of C, making B the son of A.<br/>F is the spouse of A, making F the mother of C and B.<br/>D is the son of B. The mother of B is F.<br/>Therefore, F is the paternal grandmother of D."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "Introducing a woman, a man said, \"She is the only daughter of my wife's grandfather's only child.\" How is the woman related to the man?",
    "options_json": ["Wife", "Mother", "Sister", "Daughter"],
    "correct_answer": "Wife",
    "explanation_html": "The 'grandfather's only child' refers to the parent of the man's wife.<br/>The 'only daughter' of the wife's parent would be the wife herself.<br/>Therefore, the woman being introduced is the man's wife."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "A is the mother of B. B is the sister of C. D is the son of C. E is the brother of D. F is the mother of E. G is the granddaughter of A. H has only two children B and C. How is F related to H?",
    "options_json": ["Daughter", "Daughter-in-law", "Sister-in-law", "Niece"],
    "correct_answer": "Daughter-in-law",
    "explanation_html": "D is the son of C, and E is the brother of D. So E is the son of C.<br/>F is the mother of E. Since C is the parent of E and F is the mother, C must be the father and F is his wife.<br/>H has exactly two children, B and C. A is the mother of B. Therefore, H is the father of B and C.<br/>Since F is the wife of H's son (C), F is the daughter-in-law of H."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "Pointing to a man, a woman said, \"His mother is the wife of my father's only son.\" How is the woman related to the man?",
    "options_json": ["Mother", "Aunt", "Sister", "Wife"],
    "correct_answer": "Aunt",
    "explanation_html": "The 'only son of my father' refers to the woman's brother.<br/>The 'wife' of her brother is her sister-in-law.<br/>The man's mother is this sister-in-law. Therefore, the man is the son of her brother.<br/>This makes the woman the aunt of the man."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "If 'A + B' means A is the sister of B; 'A - B' means A is the brother of B; 'A * B' means A is the daughter of B; 'A / B' means A is the mother of B. How is P related to S in the expression 'P + Q - R * S'?",
    "options_json": ["Niece", "Sister", "Daughter", "Mother"],
    "correct_answer": "Daughter",
    "explanation_html": "Let's decode the expression 'P + Q - R * S':<br/>P + Q -> P is the sister of Q.<br/>Q - R -> Q is the brother of R.<br/>R * S -> R is the daughter of S.<br/>From this, P, Q, and R are siblings. Since R is the daughter of S, S is the parent of P, Q, and R.<br/>Since P is female (sister of Q), P is the daughter of S."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "A man goes to a park and sees a girl who is the daughter of the only son of his grandmother. How is the girl related to the man?",
    "options_json": ["Cousin", "Niece", "Sister", "Aunt"],
    "correct_answer": "Sister",
    "explanation_html": "The 'only son of his grandmother' refers to the man's father.<br/>The 'daughter' of his father is his sister.<br/>Therefore, the girl is the sister of the man."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "Pointing to a man, a woman said, \"He is the brother of my uncle's daughter.\" How is the man related to the woman?",
    "options_json": ["Brother", "Cousin", "Nephew", "Uncle"],
    "correct_answer": "Cousin",
    "explanation_html": "The woman's 'uncle's daughter' is her cousin.<br/>The 'brother' of her cousin is also her cousin.<br/>Thus, the man is the cousin of the woman."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "A is the brother of B. C is the father of A. D is the brother of E. E is the daughter of B. Then, who is the uncle of D?",
    "options_json": ["A", "B", "C", "E"],
    "correct_answer": "A",
    "explanation_html": "E is the daughter of B, and D is the brother of E. This means D is the son of B.<br/>A is the brother of B. Since A is the brother of D's parent (B), A is the uncle of D."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "X introduces Y saying, \"He is the husband of the granddaughter of the father of my father.\" If X is male and has no siblings, how is Y related to X?",
    "options_json": ["Brother", "Brother-in-law", "Son-in-law", "Uncle"],
    "correct_answer": "Brother-in-law",
    "explanation_html": "The 'father of my father' is X's grandfather.<br/>The 'granddaughter' of X's grandfather could be X's sister or cousin. Since X has no siblings, she must be his cousin (or wait, if X is introducing Y as the husband of the granddaughter of the father of my father... actually, if X has no siblings, the granddaughter must be a cousin).<br/>However, in standard blood relation terminology, the husband of a cousin/sister is a Brother-in-law.<br/>Therefore, Y is the brother-in-law to X."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "MEDIUM",
    "time_limit_seconds": 90,
    "question_text": "P is the father of Q. R is the daughter of S. T is the brother of P. Q is the sister of R. How is T related to R?",
    "options_json": ["Father", "Uncle", "Brother", "Grandfather"],
    "correct_answer": "Uncle",
    "explanation_html": "Q is the sister of R. P is the father of Q, which means P is also the father of R.<br/>T is the brother of P.<br/>Since T is the brother of R's father, T is the uncle of R."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "EASY",
    "time_limit_seconds": 60,
    "question_text": "Pointing to a person, a man said to a woman, \"His mother is the only daughter of your father.\" How was the woman related to the person?",
    "options_json": ["Aunt", "Mother", "Wife", "Sister"],
    "correct_answer": "Mother",
    "explanation_html": "The man tells the woman that the person's mother is the 'only daughter of your father'.<br/>The 'only daughter of your father' refers to the woman herself.<br/>Therefore, the woman is the mother of the person."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "P is the son of Q. Q and R are sisters. S is the mother of R. T is the son of S. Which of the following statements is correct?",
    "options_json": ["T is the brother of Q", "T is the maternal uncle of P", "S is the grandmother of P", "All of the above"],
    "correct_answer": "All of the above",
    "explanation_html": "Q and R are sisters. S is the mother of R, meaning S is also the mother of Q. T is the son of S, making T the brother of Q and R.<br/>P is the son of Q. Since S is Q's mother, S is the grandmother of P.<br/>Since T is the brother of P's mother (Q), T is the maternal uncle of P.<br/>All three statements are correct."
  },
  {
    "category": "Logical Reasoning",
    "topic": "Blood Relations",
    "difficulty": "HARD",
    "time_limit_seconds": 120,
    "question_text": "Pointing to a lady in a photograph, Meera said, \"Her father's only son's wife is my mother-in-law.\" How is Meera's husband related to that lady in the photo?",
    "options_json": ["Nephew", "Son", "Brother", "Cousin"],
    "correct_answer": "Nephew",
    "explanation_html": "The lady's 'father's only son' refers to the lady's brother.<br/>The 'wife' of her brother is the lady's sister-in-law.<br/>Meera says this sister-in-law is her mother-in-law.<br/>This means Meera's husband is the son of the lady's sister-in-law (and brother).<br/>The son of the lady's brother is the lady's nephew. Thus, Meera's husband is the nephew."
  }
]

async def insert_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        count = 0
        for item in data:
            q = Question(
                category=item["category"],
                topic=item["topic"],
                difficulty=DifficultyLevel(item["difficulty"]),
                time_limit_seconds=item["time_limit_seconds"],
                question_text=item["question_text"],
                options_json=item["options_json"],
                correct_answer=item["correct_answer"],
                explanation_html=item["explanation_html"]
            )
            session.add(q)
            count += 1
            
        await session.commit()
        print(f"Successfully inserted {count} questions into the database.")

if __name__ == "__main__":
    asyncio.run(insert_data())
