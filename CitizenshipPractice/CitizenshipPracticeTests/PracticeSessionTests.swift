import XCTest
@testable import CitizenshipPractice

final class PracticeSessionTests: XCTestCase {
    func testInterviewPassesAtTwelveCorrect() {
        var session = PracticeSession(kind: .interview, questionIDs: Array(1...20))
        for _ in 0..<11 { session.record(correct: true) }
        XCTAssertFalse(session.isFinished)
        session.record(correct: true)
        XCTAssertTrue(session.isFinished)
        XCTAssertTrue(session.passed)
        XCTAssertNil(session.currentID)
    }

    func testInterviewFailsAtNineWrong() {
        var session = PracticeSession(kind: .interview, questionIDs: Array(1...20))
        for _ in 0..<8 { session.record(correct: false) }
        XCTAssertFalse(session.isFinished)
        session.record(correct: false)
        XCTAssertTrue(session.isFinished)
        XCTAssertFalse(session.passed)
        XCTAssertEqual(session.missedIDs, Array(1...9))
    }

    func testPracticeRunsThroughEveryQuestion() {
        var session = PracticeSession(kind: .practice, questionIDs: [5, 6, 7])
        XCTAssertEqual(session.currentID, 5)
        session.record(correct: false)
        session.record(correct: false)
        XCTAssertEqual(session.currentID, 7)
        session.record(correct: true)
        XCTAssertTrue(session.isFinished)
        XCTAssertEqual(session.correctCount, 1)
        XCTAssertEqual(session.wrongCount, 2)
    }

    func testInterviewDrawsTwentyDifferentQuestions() {
        let ids = PracticeSession.interviewQuestions(from: Array(1...128))
        XCTAssertEqual(ids.count, 20)
        XCTAssertEqual(Set(ids).count, 20)
    }
}

final class SpokenTextTests: XCTestCase {
    func testParenthesesAreReadWithoutTheBrackets() {
        XCTAssertEqual(SpokenText.plain("(U.S.) Constitution"), "U.S. Constitution")
        XCTAssertEqual(SpokenText.plain("Twenty-seven (27)"), "Twenty-seven")
        XCTAssertEqual(SpokenText.plain("Senate and House (of Representatives)"), "Senate and House of Representatives")
    }

    func testAnswerPassage() {
        let answers = [Answer(text: "Republic"), Answer(text: "Representative democracy")]
        XCTAssertEqual(
            SpokenText.answers(answers, required: 1, readAll: false),
            "Answer: Republic. Or: Representative democracy."
        )
        let many = (1...6).map { Answer(text: "State \($0)") }
        XCTAssertEqual(
            SpokenText.answers(many, required: 5, readAll: false),
            "Give 5 answers. For example: State 1. State 2. State 3. State 4. State 5."
        )
    }
}
