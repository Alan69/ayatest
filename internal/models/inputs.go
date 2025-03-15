package models

import "github.com/google/uuid"

// ProductInput is the input for creating or updating a product
type ProductInput struct {
	Title        string      `json:"title"`
	Description  *string     `json:"description"`
	Sum          *int        `json:"sum"`
	Score        *int        `json:"score"`
	Time         *int        `json:"time"`
	SubjectLimit *int        `json:"subject_limit"`
	ProductType  ProductType `json:"product_type"`
}

// TestInput is the input for creating or updating a test
type TestInput struct {
	Title             string    `json:"title"`
	NumberOfQuestions *int      `json:"number_of_questions"`
	Time              *int      `json:"time"`
	Score             *int      `json:"score"`
	ProductID         uuid.UUID `json:"product_id"`
	Grade             *int      `json:"grade"`
	IsRequired        *bool     `json:"is_required"`
}

// SourceInput is the input for creating or updating a source
type SourceInput struct {
	Text string `json:"text"`
}

// QuestionInput is the input for creating or updating a question
type QuestionInput struct {
	TestID        uuid.UUID `json:"test_id"`
	Text          *string   `json:"text"`
	Text2         *string   `json:"text2"`
	Text3         *string   `json:"text3"`
	ImgPath       *string   `json:"img_path"`
	TaskType      *int      `json:"task_type"`
	Level         *int      `json:"level"`
	Status        *int      `json:"status"`
	Category      *string   `json:"category"`
	Subcategory   *string   `json:"subcategory"`
	Theme         *string   `json:"theme"`
	Subtheme      *string   `json:"subtheme"`
	Target        *string   `json:"target"`
	Source        *string   `json:"source"`
	SourceTextID  *uuid.UUID `json:"source_text_id"`
	DetailID      *int      `json:"detail_id"`
	LngID         *int      `json:"lng_id"`
	LngTitle      *string   `json:"lng_title"`
	SubjectID     *int      `json:"subject_id"`
	SubjectTitle  *string   `json:"subject_title"`
	ClassNumber   *int      `json:"class_number"`
}

// OptionInput is the input for creating or updating an option
type OptionInput struct {
	QuestionID uuid.UUID `json:"question_id"`
	Text       string    `json:"text"`
	ImgPath    *string   `json:"img_path"`
	IsCorrect  bool      `json:"is_correct"`
}

// UserInput is the input for creating a user
type UserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// StartTestInput is the input for starting a test
type StartTestInput struct {
	UserID    uuid.UUID   `json:"user_id"`
	ProductID uuid.UUID   `json:"product_id"`
	TestIDs   []uuid.UUID `json:"test_ids"`
}

// AnswerQuestionInput is the input for answering a question
type AnswerQuestionInput struct {
	CompletedTestID  uuid.UUID   `json:"completed_test_id"`
	TestID           uuid.UUID   `json:"test_id"`
	QuestionID       uuid.UUID   `json:"question_id"`
	SelectedOptionIDs []uuid.UUID `json:"selected_option_ids"`
}

// CompleteTestInput is the input for completing a test
type CompleteTestInput struct {
	CompletedTestID uuid.UUID `json:"completed_test_id"`
	TimeSpent       int       `json:"time_spent"`
} 