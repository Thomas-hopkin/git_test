export type ChallengeType = 'multiple-choice' | 'fill-blank' | 'fix-bug';

export interface Challenge {
  id: string;
  type: ChallengeType;
  language: string;
  level: number;
  xpReward: number;
  question: string;
  code?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  concept: string;
}

export const challenges: Challenge[] = [
  // Level 1 — Variables
  {
    id: 'py-001',
    type: 'multiple-choice',
    language: 'Python',
    level: 1,
    xpReward: 10,
    question: 'What does this code print?',
    code: 'x = 5\nprint(x)',
    options: ['x', '5', 'None', 'Error'],
    correctAnswer: '5',
    explanation: 'x holds the value 5. print(x) outputs whatever is stored in x, not the variable name.',
    concept: 'Variables',
  },
  {
    id: 'py-002',
    type: 'multiple-choice',
    language: 'Python',
    level: 1,
    xpReward: 10,
    question: 'Which line correctly stores your name in a variable?',
    options: ['name = "Alex"', '"name" = Alex', 'var name = "Alex"', 'name := "Alex"'],
    correctAnswer: 'name = "Alex"',
    explanation: 'In Python you assign with = and text goes in quotes. No "var" keyword needed.',
    concept: 'Variables',
  },
  {
    id: 'py-003',
    type: 'fill-blank',
    language: 'Python',
    level: 1,
    xpReward: 15,
    question: 'Complete the code to store the number 42 in a variable called answer.',
    code: '_____ = 42',
    correctAnswer: 'answer',
    explanation: 'Variable names go on the left side of =. The value goes on the right.',
    concept: 'Variables',
  },

  // Level 2 — Data types
  {
    id: 'py-004',
    type: 'multiple-choice',
    language: 'Python',
    level: 2,
    xpReward: 15,
    question: 'What type is the value "hello"?',
    options: ['int', 'str', 'bool', 'float'],
    correctAnswer: 'str',
    explanation: 'Text in quotes is a string (str). Numbers without quotes are int or float.',
    concept: 'Data Types',
  },
  {
    id: 'py-005',
    type: 'multiple-choice',
    language: 'Python',
    level: 2,
    xpReward: 15,
    question: 'What does this print?',
    code: 'print(10 / 2)',
    options: ['5', '5.0', '2', 'Error'],
    correctAnswer: '5.0',
    explanation: 'In Python 3, / always returns a float. Use // for integer division.',
    concept: 'Data Types',
  },
  {
    id: 'py-006',
    type: 'fix-bug',
    language: 'Python',
    level: 2,
    xpReward: 20,
    question: 'Fix the bug — this should print the number 7, not an error.',
    code: 'x = "3"\ny = 4\nprint(x + y)',
    options: ['x = 3', 'y = "4"', 'print(x, y)', 'print(int(x) + y)... wait, just fix x'],
    correctAnswer: 'x = 3',
    explanation: 'You can\'t add a string and a number. Remove the quotes from "3" to make it an integer.',
    concept: 'Data Types',
  },

  // Level 3 — Conditionals
  {
    id: 'py-007',
    type: 'multiple-choice',
    language: 'Python',
    level: 3,
    xpReward: 20,
    question: 'What prints when age = 15?',
    code: 'age = 15\nif age >= 18:\n    print("adult")\nelse:\n    print("minor")',
    options: ['adult', 'minor', 'Nothing', 'Error'],
    correctAnswer: 'minor',
    explanation: '15 is not >= 18, so the else branch runs and prints "minor".',
    concept: 'Conditionals',
  },
  {
    id: 'py-008',
    type: 'fill-blank',
    language: 'Python',
    level: 3,
    xpReward: 20,
    question: 'Complete the condition to check if x equals 10.',
    code: 'if x _____ 10:\n    print("ten")',
    correctAnswer: '==',
    explanation: '== checks equality. = is for assignment. This is one of the most common beginner mistakes.',
    concept: 'Conditionals',
  },

  // Level 4 — Loops
  {
    id: 'py-009',
    type: 'multiple-choice',
    language: 'Python',
    level: 4,
    xpReward: 25,
    question: 'How many times does this loop run?',
    code: 'for i in range(5):\n    print(i)',
    options: ['4', '5', '6', 'Infinite'],
    correctAnswer: '5',
    explanation: 'range(5) gives [0,1,2,3,4] — five values. The loop runs once per value.',
    concept: 'Loops',
  },
  {
    id: 'py-010',
    type: 'fix-bug',
    language: 'Python',
    level: 4,
    xpReward: 25,
    question: 'This should print 1 to 5 but prints 0 to 4. Fix it.',
    code: 'for i in range(5):\n    print(i)',
    options: ['range(1, 6)', 'range(5, 1)', 'range(1, 5)', 'range(6)'],
    correctAnswer: 'range(1, 6)',
    explanation: 'range(start, stop) goes from start up to (not including) stop. range(1,6) gives 1,2,3,4,5.',
    concept: 'Loops',
  },

  // Level 5 — Functions
  {
    id: 'py-011',
    type: 'multiple-choice',
    language: 'Python',
    level: 5,
    xpReward: 30,
    question: 'What does this function return?',
    code: 'def double(n):\n    return n * 2\n\nresult = double(4)',
    options: ['4', '8', '2', 'double'],
    correctAnswer: '8',
    explanation: 'double(4) runs the function with n=4. It returns 4*2 which is 8.',
    concept: 'Functions',
  },
  {
    id: 'py-012',
    type: 'fill-blank',
    language: 'Python',
    level: 5,
    xpReward: 30,
    question: 'Complete the function definition keyword.',
    code: '_____ greet(name):\n    print("Hello", name)',
    correctAnswer: 'def',
    explanation: 'def is how you define a function in Python. It stands for "define".',
    concept: 'Functions',
  },

  // Level 6 — JavaScript intro
  {
    id: 'js-001',
    type: 'multiple-choice',
    language: 'JavaScript',
    level: 6,
    xpReward: 30,
    question: 'What\'s the difference between let and const?',
    options: [
      'const can\'t be reassigned',
      'let can\'t be reassigned',
      'They\'re identical',
      'const is faster',
    ],
    correctAnswer: 'const can\'t be reassigned',
    explanation: 'const means the binding is fixed — you can\'t do x = something else. let allows reassignment.',
    concept: 'Variables',
  },
  {
    id: 'js-002',
    type: 'multiple-choice',
    language: 'JavaScript',
    level: 6,
    xpReward: 30,
    question: 'What does this print?',
    code: 'console.log(typeof 42)',
    options: ['int', 'number', '42', 'integer'],
    correctAnswer: 'number',
    explanation: 'JavaScript has one number type called "number" — no separate int/float distinction.',
    concept: 'Data Types',
  },
];

export const getLevelChallenges = (level: number): Challenge[] =>
  challenges.filter((c) => c.level === level);

export const getMaxLevel = (): number =>
  Math.max(...challenges.map((c) => c.level));
