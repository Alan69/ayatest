package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProductType enum
type ProductType string

const (
	ProductTypeStudent ProductType = "STUDENT"
	ProductTypeTeacher ProductType = "TEACHER"
)

// Product represents a test bundle with metadata
type Product struct {
	ID           uuid.UUID  `gorm:"type:uuid;primary_key" json:"id"`
	Title        string     `gorm:"size:200" json:"title"`
	Description  *string    `json:"description"`
	Sum          *int       `json:"sum"`
	Score        *int       `json:"score"`
	Time         *int       `json:"time"`
	SubjectLimit *int       `json:"subject_limit"`
	ProductType  ProductType `gorm:"size:10;default:STUDENT" json:"product_type"`
	DateCreated  time.Time  `gorm:"autoCreateTime" json:"date_created"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// Test represents a test belonging to a product
type Test struct {
	ID                uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Title             string    `gorm:"size:200" json:"title"`
	NumberOfQuestions *int      `json:"number_of_questions"`
	Time              *int      `json:"time"`
	Score             *int      `json:"score"`
	ProductID         uuid.UUID `gorm:"type:uuid" json:"product_id"`
	Product           Product   `gorm:"foreignKey:ProductID" json:"-"`
	Grade             *int      `json:"grade"`
	DateCreated       time.Time `gorm:"autoCreateTime" json:"date_created"`
	IsRequired        bool      `gorm:"default:false" json:"is_required"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (t *Test) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// Source represents a source text used in questions
type Source struct {
	ID   uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Text string    `json:"text"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (s *Source) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Question represents a question belonging to a test
type Question struct {
	ID            uuid.UUID  `gorm:"type:uuid;primary_key" json:"id"`
	TestID        uuid.UUID  `gorm:"type:uuid" json:"test_id"`
	Test          Test       `gorm:"foreignKey:TestID" json:"-"`
	Text          *string    `json:"text"`
	Text2         *string    `json:"text2"`
	Text3         *string    `json:"text3"`
	ImgPath       *string    `json:"img_path"`
	TaskType      *int       `json:"task_type"`
	Level         *int       `json:"level"`
	Status        *int       `json:"status"`
	Category      *string    `gorm:"size:2000" json:"category"`
	Subcategory   *string    `gorm:"size:2000" json:"subcategory"`
	Theme         *string    `gorm:"size:2000" json:"theme"`
	Subtheme      *string    `gorm:"size:2000" json:"subtheme"`
	Target        *string    `json:"target"`
	Source        *string    `gorm:"size:2000" json:"source"`
	SourceTextID  *uuid.UUID `gorm:"type:uuid" json:"source_text_id"`
	SourceText    *Source    `gorm:"foreignKey:SourceTextID" json:"-"`
	DetailID      *int       `json:"detail_id"`
	LngID         *int       `json:"lng_id"`
	LngTitle      *string    `gorm:"size:100" json:"lng_title"`
	SubjectID     *int       `json:"subject_id"`
	SubjectTitle  *string    `gorm:"size:2000" json:"subject_title"`
	ClassNumber   *int       `json:"class_number"`
	Options       []Option   `gorm:"foreignKey:QuestionID" json:"options"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (q *Question) BeforeCreate(tx *gorm.DB) error {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	return nil
}

// Option represents an answer option for a question
type Option struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	QuestionID uuid.UUID `gorm:"type:uuid" json:"question_id"`
	Question   Question  `gorm:"foreignKey:QuestionID" json:"-"`
	Text       string    `gorm:"size:2000" json:"text"`
	ImgPath    *string   `json:"img_path"`
	IsCorrect  bool      `gorm:"default:false" json:"is_correct"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (o *Option) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// User represents a user in the system
type User struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Username string    `gorm:"size:100;unique" json:"username"`
	Email    string    `gorm:"size:100;unique" json:"email"`
	Password string    `gorm:"size:100" json:"-"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// CompletedTest represents a test completed by a user
type CompletedTest struct {
	ID            uuid.UUID          `gorm:"type:uuid;primary_key" json:"id"`
	UserID        uuid.UUID          `gorm:"type:uuid" json:"user_id"`
	User          User               `gorm:"foreignKey:UserID" json:"-"`
	ProductID     uuid.UUID          `gorm:"type:uuid" json:"product_id"`
	Product       Product            `gorm:"foreignKey:ProductID" json:"-"`
	CompletedDate time.Time          `gorm:"autoCreateTime" json:"completed_date"`
	StartTestTime *time.Time         `json:"start_test_time"`
	TimeSpent     *int               `json:"time_spent"`
	Tests         []*Test            `gorm:"many2many:completed_test_tests;" json:"tests"`
	Questions     []CompletedQuestion `gorm:"foreignKey:CompletedTestID" json:"completed_questions"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (ct *CompletedTest) BeforeCreate(tx *gorm.DB) error {
	if ct.ID == uuid.Nil {
		ct.ID = uuid.New()
	}
	return nil
}

// CompletedQuestion represents a question answered by a user
type CompletedQuestion struct {
	ID             uuid.UUID     `gorm:"type:uuid;primary_key" json:"id"`
	CompletedTestID uuid.UUID     `gorm:"type:uuid" json:"completed_test_id"`
	CompletedTest  CompletedTest `gorm:"foreignKey:CompletedTestID" json:"-"`
	TestID         uuid.UUID     `gorm:"type:uuid" json:"test_id"`
	Test           Test          `gorm:"foreignKey:TestID" json:"-"`
	QuestionID     *uuid.UUID    `gorm:"type:uuid" json:"question_id"`
	Question       *Question     `gorm:"foreignKey:QuestionID" json:"-"`
	SelectedOptions []*Option     `gorm:"many2many:completed_question_selected_options;" json:"selected_options"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (cq *CompletedQuestion) BeforeCreate(tx *gorm.DB) error {
	if cq.ID == uuid.Nil {
		cq.ID = uuid.New()
	}
	return nil
} 