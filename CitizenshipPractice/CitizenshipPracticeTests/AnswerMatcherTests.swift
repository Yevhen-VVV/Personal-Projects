import XCTest
@testable import CitizenshipPractice

final class AnswerMatcherTests: XCTestCase {
    private let bank = QuestionBank.standard

    private func verdict(_ id: Int, _ reply: String, local: LocalAnswers = LocalAnswers()) -> Verdict {
        let question = bank.question(id: id)!
        return AnswerMatcher.check(reply, against: question.resolvedAnswers(using: local), required: question.required).verdict
    }

    /// Replies the way people actually say them, including the way speech recognition writes them down.
    func testTypicalReplies() {
        let cases: [(Int, String, Verdict)] = [
            (2, "the constitution", .correct),
            (2, "the Declaration of Independence", .incorrect),
            (2, "", .incorrect),
            (2, "I don't know", .incorrect),
            (5, "amendments", .correct),
            (7, "27", .correct),
            (7, "twenty-seven", .correct),
            (7, "twenty seven amendments", .correct),
            (7, "26", .incorrect),
            (8, "all men are created equal", .correct),
            (12, "capitalism", .correct),
            (12, "a market economy", .correct),
            (12, "communism", .incorrect),
            (13, "no one is above the law", .correct),
            (13, "nobody is above the law", .correct),
            (15, "so no branch becomes too powerful", .correct),
            (15, "checks and balances", .correct),
            (16, "legislative, executive and judicial", .correct),
            (16, "legislative and executive", .incorrect),
            (19, "the Senate and the House of Representatives", .correct),
            (19, "the Senate", .incorrect),
            (21, "one hundred", .correct),
            (21, "100", .correct),
            (24, "four hundred thirty-five", .correct),
            (24, "435", .correct),
            (36, "four years", .correct),
            (36, "4", .correct),
            (36, "six years", .incorrect),
            (37, "the twenty-second amendment", .correct),
            (37, "22nd amendment", .correct),
            (40, "the vice president", .correct),
            (40, "the Speaker of the House", .incorrect),
            (41, "he can veto bills", .correct),
            (48, "Secretary of State and Attorney General", .correct),
            (48, "Secretary of Defense and the Vice President", .correct),
            (48, "Secretary of State", .incorrect),
            (55, "for life", .correct),
            (55, "until they retire", .correct),
            (55, "ten years", .incorrect),
            (65, "freedom of speech, freedom of religion, and the right to bear arms", .correct),
            (65, "freedom of speech", .incorrect),
            (66, "the United States", .correct),
            (66, "the flag", .correct),
            (66, "the president", .incorrect),
            (67, "obey the laws and defend the Constitution", .correct),
            (67, "obey the laws", .incorrect),
            (78, "Jefferson", .correct),
            (78, "Thomas Jeferson", .correct),
            (78, "George Washington", .incorrect),
            (79, "July 4th, 1776", .correct),
            (79, "the fourth of July 1776", .correct),
            (79, "1776", .incorrect),
            (81, "New York, New Jersey, Virginia, Georgia and Delaware", .correct),
            (81, "North Carolina South Carolina Georgia Maryland Delaware", .correct),
            (81, "New York and Virginia", .incorrect),
            (81, "New York New Hampshire Texas Florida Ohio", .incorrect),
            (86, "he was the first president", .correct),
            (86, "the father of our country", .correct),
            (87, "he wrote the Declaration of Independence", .correct),
            (87, "third president", .correct),
            (87, "first president", .incorrect),
            (94, "he freed the slaves", .correct),
            (97, "the fourteenth amendment", .correct),
            (97, "the 15th amendment", .incorrect),
            (100, "World War 2", .correct),
            (100, "the Civil War", .incorrect),
            (105, "Franklin Roosevelt", .correct),
            (105, "Lincoln", .incorrect),
            (113, "people should not be judged by the color of their skin", .correct),
            (119, "Washington D.C.", .correct),
            (119, "New York", .incorrect),
            (121, "because there were thirteen original colonies", .correct),
            (121, "50 states", .incorrect),
            (122, "a star for each state", .correct),
            (126, "Christmas, Thanksgiving and the Fourth of July", .correct),
            (126, "MLK day, New Year's day and Juneteenth", .correct),
            (126, "Christmas and Thanksgiving", .incorrect),
            (128, "to honor veterans", .correct),
        ]
        for (id, reply, expected) in cases {
            XCTAssertEqual(verdict(id, reply), expected, "Q\(id): “\(reply)”")
        }
    }

    func testMatchedAnswersAreReportedForHighlighting() {
        let question = bank.question(id: 81)!
        let result = AnswerMatcher.check("Georgia, Delaware", against: question.answers, required: question.required)
        let names = result.matched.map { question.answers[$0].text }
        XCTAssertEqual(Set(names), ["Georgia", "Delaware"])
        XCTAssertEqual(result.verdict, .incorrect)
    }

    func testNumbersAreWrittenAsDigits() {
        XCTAssertEqual(AnswerMatcher.tokens(in: "Four hundred thirty-five"), ["435"])
        XCTAssertEqual(AnswerMatcher.tokens(in: "twenty-seven"), ["27"])
        XCTAssertEqual(AnswerMatcher.tokens(in: "the sixteenth president"), ["16", "president"])
        XCTAssertEqual(AnswerMatcher.tokens(in: "22nd Amendment"), ["22", "amendment"])
        XCTAssertEqual(AnswerMatcher.tokens(in: "World War II"), ["world", "war", "2"])
    }

    func testParenthesesAreOptional() {
        XCTAssertEqual(AnswerMatcher.requiredTokens(in: "(Thomas) Jefferson"), ["jefferson"])
        XCTAssertEqual(AnswerMatcher.requiredTokens(in: "Senate and House (of Representatives)"), ["senate", "house"])
        XCTAssertEqual(AnswerMatcher.requiredTokens(in: "Obey the laws of the United States"), ["obey", "law"])
        XCTAssertEqual(AnswerMatcher.requiredTokens(in: "The United States"), ["united", "state"])
    }

    // MARK: Answers that depend on the learner

    func testCurrentOfficialsAcceptTheSurname() {
        let local = LocalAnswers(president: "Donald J. Trump", chiefJustice: "John G. Roberts, Jr.")
        XCTAssertEqual(verdict(38, "Trump", local: local), .correct)
        XCTAssertEqual(verdict(38, "Donald Trump", local: local), .correct)
        XCTAssertEqual(verdict(38, "Biden", local: local), .incorrect)
        XCTAssertEqual(verdict(57, "John Roberts", local: local), .correct)
    }

    func testLocalQuestionsAreUncheckedUntilSetUp() {
        XCTAssertEqual(verdict(62, "Sacramento"), .unchecked)
        XCTAssertEqual(verdict(23, "Padilla"), .unchecked)
    }

    func testStateCapitalAndSenators() {
        let california = LocalAnswers(place: Place.withCode("CA"), senators: ["Alex Padilla", "Adam Schiff"])
        XCTAssertEqual(verdict(62, "Sacramento", local: california), .correct)
        XCTAssertEqual(verdict(62, "Los Angeles", local: california), .incorrect)
        XCTAssertEqual(verdict(23, "Schiff", local: california), .correct)

        let minnesota = LocalAnswers(place: Place.withCode("MN"))
        XCTAssertEqual(verdict(62, "St. Paul", local: minnesota), .correct)
    }

    func testDistrictOfColumbia() {
        let dc = LocalAnswers(place: Place.withCode("DC"))
        XCTAssertEqual(verdict(23, "D.C. has no senators", local: dc), .correct)
        XCTAssertEqual(verdict(61, "there is no governor", local: dc), .correct)
        XCTAssertEqual(verdict(62, "D.C. is not a state", local: dc), .correct)
    }

    func testSurname() {
        XCTAssertEqual(Answer.surname(of: "John G. Roberts, Jr."), "Roberts")
        XCTAssertEqual(Answer.surname(of: "JD Vance"), "Vance")
        XCTAssertNil(Answer.surname(of: "Madonna"))
    }
}
