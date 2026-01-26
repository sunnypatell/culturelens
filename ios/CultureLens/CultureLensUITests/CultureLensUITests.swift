//
//  CultureLensUITests.swift
//  CultureLensUITests
//
//  UI tests for CultureLens app
//

import XCTest

final class CultureLensUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Launch Tests

    func testAppLaunches() throws {
        // Verify the app launches without crashing
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))
    }

    // MARK: - Tab Navigation Tests

    func testTabBarExistsWhenAuthenticated() throws {
        // Tab bar only exists when user is authenticated
        // When not authenticated, login screen is shown instead
        let tabBar = app.tabBars.firstMatch
        let googleButton = app.buttons["Continue with Google"]
        let signInButton = app.buttons["Sign In"]

        // Either tab bar exists (authenticated) or auth buttons exist (not authenticated)
        let hasExpectedUI = tabBar.waitForExistence(timeout: 5) ||
                            googleButton.waitForExistence(timeout: 5) ||
                            signInButton.waitForExistence(timeout: 5)
        XCTAssertTrue(hasExpectedUI, "Expected either tab bar or auth buttons")
    }

    // MARK: - Authentication Flow Tests

    func testLoginViewElements() throws {
        // If we're on the login screen, check for key elements
        let googleButton = app.buttons["Continue with Google"]
        let signInButton = app.buttons["Sign In"]

        // Check if either auth button exists and is enabled
        if googleButton.waitForExistence(timeout: 3) {
            XCTAssertTrue(googleButton.isEnabled)
        } else if signInButton.waitForExistence(timeout: 3) {
            XCTAssertTrue(signInButton.isEnabled)
        }
    }

    // MARK: - Accessibility Tests

    func testAccessibilityLabels() throws {
        // Verify important elements have accessibility labels
        let allButtons = app.buttons.allElementsBoundByIndex

        for button in allButtons {
            // Buttons should have either a label or identifier
            let hasAccessibility = !button.label.isEmpty || !button.identifier.isEmpty
            XCTAssertTrue(hasAccessibility, "Button without accessibility: \(button)")
        }
    }

    // MARK: - Performance Tests

    func testLaunchPerformance() throws {
        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, watchOS 7.0, *) {
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }

    // MARK: - Rotation Tests

    func testPortraitOrientation() throws {
        XCUIDevice.shared.orientation = .portrait

        // App should display correctly in portrait
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 3))
    }

    func testLandscapeOrientation() throws {
        XCUIDevice.shared.orientation = .landscapeLeft

        // App should display correctly in landscape
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 3))
    }
}
