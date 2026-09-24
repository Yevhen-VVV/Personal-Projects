import XCTest
@testable import CitizenshipPractice

final class QuestionBankTests: XCTestCase {
    private let bank = QuestionBank.standard

    func testHasAll128QuestionsNumberedInOrder() {
        XCTAssertEqual(bank.questions.map(\.id), Array(1...128))
    }

    func testGroupsMatchTheOfficialSections() {
        let groups = bank.groups.map { "\($0.section) / \($0.subsection) / \($0.questions.count)" }
        XCTAssertEqual(groups, [
            "American Government / Principles of American Government / 15",
            "American Government / System of Government / 47",
            "American Government / Rights and Responsibilities / 10",
            "American History / Colonial Period and Independence / 17",
            "American History / 1800s / 10",
            "American History / Recent American History and Other Important Historical Information / 19",
            "Symbols and Holidays / Symbols / 6",
            "Symbols and Holidays / Holidays / 4",
        ])
    }

    func testEveryQuestionCanBeAnswered() {
        for question in bank.questions {
            XCTAssertFalse(question.text.isEmpty, "Q\(question.id)")
            if question.dynamic == nil {
                XCTAssertGreaterThanOrEqual(question.answers.count, question.required, "Q\(question.id) asks for more answers than it lists")
            } else {
                XCTAssertTrue(question.answers.isEmpty, "Q\(question.id) is dynamic but also lists answers")
            }
        }
    }

    func testEveryOfficialAnswerMatchesItself() {
        for question in bank.questions {
            for answer in question.answers {
                for form in [answer.text] + answer.also {
                    let result = AnswerMatcher.check(form, against: question.answers, required: 1)
                    XCTAssertEqual(result.verdict, .correct, "Q\(question.id): “\(form)” does not match its own answer")
                }
            }
        }
    }

    func testQuestionsThatAskForSeveralAnswers() {
        let multiple = bank.questions.filter { $0.required > 1 }.map { "\($0.id):\($0.required)" }
        XCTAssertEqual(multiple, ["10:2", "48:2", "65:3", "67:2", "69:2", "81:5", "126:3"])
    }

    func testDynamicQuestions() {
        let dynamic = bank.questions.compactMap { question in question.dynamic.map { "\(question.id):\($0.rawValue)" } }
        XCTAssertEqual(dynamic, [
            "23:senators", "29:representative", "30:speaker", "38:president", "39:vicePresident",
            "57:chiefJustice", "61:governor", "62:stateCapital",
        ])
    }
}
