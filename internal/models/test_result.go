package models

// TestResult represents the result of a completed test
type TestResult struct {
	Score         int
	MaxScore      int
	CorrectCount  int
	TotalCount    int
	PassThreshold float64
	Passed        bool
}
