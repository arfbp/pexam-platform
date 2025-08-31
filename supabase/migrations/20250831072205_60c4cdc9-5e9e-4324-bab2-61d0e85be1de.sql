-- Drop the old constraint that only allows single letters
ALTER TABLE questions DROP CONSTRAINT questions_correct_answer_check;

-- Add a new constraint that allows combinations of A, B, C, D
ALTER TABLE questions ADD CONSTRAINT questions_correct_answer_check 
CHECK (correct_answer ~ '^[ABCD]+$' AND length(correct_answer) >= 1 AND length(correct_answer) <= 4);