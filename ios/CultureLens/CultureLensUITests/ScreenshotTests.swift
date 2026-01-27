//
//  ScreenshotTests.swift
//  CultureLensUITests
//
//  Automated screenshot generation for all app screens.
//  Run with: xcodebuild test -scheme CultureLens -testPlan Screenshots
//  Or triggered via GitHub Actions workflow_dispatch.
//

import XCTest

final class ScreenshotTests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = true
        app = XCUIApplication()
        app.launchArguments = ["SCREENSHOT_MODE"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Helper

    private func takeScreenshot(named name: String) {
        let screenshot = app.windows.firstMatch.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)

        let fullScreenshot = XCUIScreen.main.screenshot()
        let fullAttachment = XCTAttachment(screenshot: fullScreenshot)
        fullAttachment.name = "\(name)-full"
        fullAttachment.lifetime = .keepAlways
        add(fullAttachment)
    }

    private func waitAndTap(_ element: XCUIElement, timeout: TimeInterval = 5) -> Bool {
        guard element.waitForExistence(timeout: timeout) else { return false }
        element.tap()
        return true
    }

    private func navigateToTab(index: Int) -> Bool {
        let tabBar = app.tabBars.firstMatch
        guard tabBar.waitForExistence(timeout: 10) else { return false }
        let tab = tabBar.buttons.element(boundBy: index)
        guard tab.waitForExistence(timeout: 3) else { return false }
        tab.tap()
        Thread.sleep(forTimeInterval: 1.5)
        return true
    }

    // MARK: - Main Tab Screenshots

    func testScreenshot01_HomeTab() throws {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10), "Tab bar should appear in screenshot mode")

        Thread.sleep(forTimeInterval: 1.5)
        takeScreenshot(named: "01-home-dashboard")
    }

    func testScreenshot02_RecordTab() throws {
        guard navigateToTab(index: 1) else {
            XCTFail("Tab bar not found")
            return
        }
        takeScreenshot(named: "02-recording-studio")
    }

    func testScreenshot03_LibraryTab() throws {
        guard navigateToTab(index: 2) else {
            XCTFail("Tab bar not found")
            return
        }
        takeScreenshot(named: "03-library")
    }

    func testScreenshot04_SettingsTab() throws {
        guard navigateToTab(index: 3) else {
            XCTFail("Tab bar not found")
            return
        }
        takeScreenshot(named: "04-settings")
    }

    // MARK: - Auth Screens (separate launch without screenshot mode)

    func testScreenshot05_SignInScreen() throws {
        let authApp = XCUIApplication()
        authApp.launchArguments = ["UI_TESTING"]
        authApp.launch()

        Thread.sleep(forTimeInterval: 2)

        let screenshot = authApp.windows.firstMatch.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = "05-sign-in"
        attachment.lifetime = .keepAlways
        add(attachment)

        let fullScreenshot = XCUIScreen.main.screenshot()
        let fullAttachment = XCTAttachment(screenshot: fullScreenshot)
        fullAttachment.name = "05-sign-in-full"
        fullAttachment.lifetime = .keepAlways
        add(fullAttachment)
    }

    func testScreenshot06_SignUpScreen() throws {
        let authApp = XCUIApplication()
        authApp.launchArguments = ["UI_TESTING"]
        authApp.launch()

        Thread.sleep(forTimeInterval: 2)

        let signUpButton = authApp.buttons["Sign Up"]
        let createAccountButton = authApp.buttons["Create Account"]

        if signUpButton.waitForExistence(timeout: 3) {
            signUpButton.tap()
        } else if createAccountButton.waitForExistence(timeout: 3) {
            createAccountButton.tap()
        }

        Thread.sleep(forTimeInterval: 1)

        let screenshot = authApp.windows.firstMatch.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = "06-sign-up"
        attachment.lifetime = .keepAlways
        add(attachment)

        let fullScreenshot = XCUIScreen.main.screenshot()
        let fullAttachment = XCTAttachment(screenshot: fullScreenshot)
        fullAttachment.name = "06-sign-up-full"
        fullAttachment.lifetime = .keepAlways
        add(fullAttachment)
    }

    // MARK: - Dark Mode

    func testScreenshot07_DarkModeHome() throws {
        let tabBar = app.tabBars.firstMatch
        guard tabBar.waitForExistence(timeout: 10) else {
            XCTFail("Tab bar not found")
            return
        }

        // Navigate to settings and enable dark mode
        guard navigateToTab(index: 3) else {
            XCTFail("Cannot navigate to settings")
            return
        }

        let darkButton = app.buttons["Dark"]
        if darkButton.waitForExistence(timeout: 3) {
            darkButton.tap()
            Thread.sleep(forTimeInterval: 0.5)
        }

        // Go back to home tab
        guard navigateToTab(index: 0) else {
            XCTFail("Cannot navigate to home")
            return
        }
        takeScreenshot(named: "07-home-dark-mode")
    }

    // MARK: - Landscape

    func testScreenshot08_LandscapeHome() throws {
        let tabBar = app.tabBars.firstMatch
        guard tabBar.waitForExistence(timeout: 10) else {
            XCTFail("Tab bar not found")
            return
        }

        XCUIDevice.shared.orientation = .landscapeLeft
        Thread.sleep(forTimeInterval: 1.5)
        takeScreenshot(named: "08-home-landscape")

        // Reset
        XCUIDevice.shared.orientation = .portrait
    }
}
