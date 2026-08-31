export interface MockAptitudeQuestion {
  id: number;
  topic: string;
  questionText: string;
  options: string[];
  correctOption: string;
  explanation: string;
}

export const MOCK_APTITUDE_QUESTIONS: MockAptitudeQuestion[] = [
  {
    id: 1,
    topic: "Quantitative",
    questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: ["120 meters", "180 meters", "324 meters", "150 meters"],
    correctOption: "150 meters",
    explanation: "Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 meters."
  },
  {
    id: 2,
    topic: "Logical Reasoning",
    questionText: "Look at this series: 2, 1, (1/2), (1/4)... What number should come next?",
    options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
    correctOption: "(1/8)",
    explanation: "This is a simple alternating division sequence. Each number is divided by 2 to arrive at the next number."
  },
  {
    id: 3,
    topic: "Quantitative",
    questionText: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:",
    options: ["588 apples", "600 apples", "672 apples", "700 apples"],
    correctOption: "700 apples",
    explanation: "Let original apples be x. (100 - 40)% of x = 420. So, (60/100)*x = 420 => x = 700."
  },
  {
    id: 4,
    topic: "Verbal Reasoning",
    questionText: "Choose the word which is the exact OPPOSITE of the given words: 'ENORMOUS'",
    options: ["Soft", "Average", "Tiny", "Weak"],
    correctOption: "Tiny",
    explanation: "Enormous means very large in size, quantity, or extent. Tiny is the exact opposite."
  },
  {
    id: 5,
    topic: "Logical Reasoning",
    questionText: "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["Brother", "Uncle", "Cousin", "Father"],
    correctOption: "Father",
    explanation: "The only son of Suresh's mother is Suresh himself. Therefore, the boy in the photograph is the son of Suresh."
  },
  {
    id: 6,
    topic: "Quantitative",
    questionText: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:",
    options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    correctOption: "Rs. 698",
    explanation: "Simple interest for 1 year = 854 - 815 = 39. So 3 years interest = 39 * 3 = 117. Principal = 815 - 117 = 698."
  },
  {
    id: 7,
    topic: "Logical Reasoning",
    questionText: "SCD, TEF, UGH, ____, WKL",
    options: ["CMN", "UJI", "VIJ", "IJT"],
    correctOption: "VIJ",
    explanation: "First letters are S, T, U, V, W. Second and third letters are CD, EF, GH, IJ, KL. So VIJ."
  },
  {
    id: 8,
    topic: "Verbal Reasoning",
    questionText: "Choose the word which best expresses the meaning of the given word: 'CORPULENT'",
    options: ["Lean", "Gaunt", "Emaciated", "Obese"],
    correctOption: "Obese",
    explanation: "Corpulent means fat, obese or overweight."
  },
  {
    id: 9,
    topic: "Quantitative",
    questionText: "What is the probability of getting a sum 9 from two throws of a dice?",
    options: ["1/6", "1/8", "1/9", "1/12"],
    correctOption: "1/9",
    explanation: "Favorable outcomes: (3,6), (4,5), (5,4), (6,3). Total outcomes = 36. Probability = 4/36 = 1/9."
  },
  {
    id: 10,
    topic: "Logical Reasoning",
    questionText: "If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?",
    options: ["Brother", "Sister", "Nephew", "Cannot be determined"],
    correctOption: "Cannot be determined",
    explanation: "We know A is the uncle of D, but D's gender is not given. D could be a nephew or niece."
  },
  {
    id: 11,
    topic: "Verbal Reasoning",
    questionText: "Find the correctly spelt word.",
    options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"],
    correctOption: "Accommodation",
    explanation: "The correct spelling is Accommodation (with two c's and two m's)."
  },
  {
    id: 12,
    topic: "Quantitative",
    questionText: "A man can row upstream at 8 kmph and downstream at 13 kmph. The speed of the stream is:",
    options: ["2.5 kmph", "4.2 kmph", "5 kmph", "10.5 kmph"],
    correctOption: "2.5 kmph",
    explanation: "Speed of stream = (Downstream - Upstream) / 2 = (13 - 8) / 2 = 2.5 kmph."
  },
  {
    id: 13,
    topic: "Logical Reasoning",
    questionText: "Odometer is to mileage as compass is to:",
    options: ["Speed", "Hiking", "Needle", "Direction"],
    correctOption: "Direction",
    explanation: "Odometer is an instrument to measure mileage; similarly, a compass is an instrument to determine direction."
  },
  {
    id: 14,
    topic: "Verbal Reasoning",
    questionText: "To leave someone in the lurch means:",
    options: ["To come to compromise with someone", "Constant source of annoyance to someone", "To put someone at ease", "To desert someone in his difficulties"],
    correctOption: "To desert someone in his difficulties",
    explanation: "Leaving someone in the lurch means to abandon them when they are in trouble or need your help."
  },
  {
    id: 15,
    topic: "Quantitative",
    questionText: "The difference between simple interest and compound interest on Rs. 1200 for one year at 10% per annum reckoned half-yearly is:",
    options: ["Rs. 2.50", "Rs. 3", "Rs. 3.75", "Rs. 4"],
    correctOption: "Rs. 3",
    explanation: "SI = (1200 * 10 * 1) / 100 = 120. CI (half yearly) = 1200 * (1 + 5/100)^2 - 1200 = 1200 * (441/400) - 1200 = 1323 - 1200 = 123. Difference = 3."
  }
];
