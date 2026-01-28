//
//  NetworkMonitor.swift
//  CultureLens
//
//  Network connectivity monitoring and connection testing
//

import Foundation
import Network
import Combine

// MARK: - Network Monitor
/// Monitors network connectivity and provides connection testing utilities
@MainActor
final class NetworkMonitor: ObservableObject {
    // MARK: - Singleton
    static let shared = NetworkMonitor()

    // MARK: - Published Properties
    @Published private(set) var isConnected: Bool = true
    @Published private(set) var connectionType: ConnectionType = .unknown
    @Published private(set) var lastConnectionTest: ConnectionTestResult?

    // MARK: - Types
    enum ConnectionType: String {
        case wifi = "WiFi"
        case cellular = "Cellular"
        case ethernet = "Ethernet"
        case unknown = "Unknown"
    }

    struct ConnectionTestResult: Identifiable {
        let id = UUID()
        let timestamp: Date
        let apiReachable: Bool
        let firebaseReachable: Bool
        let latencyMs: Int?
        let error: String?

        var isHealthy: Bool {
            apiReachable && firebaseReachable
        }
    }

    // MARK: - Private Properties
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "com.culturelens.networkmonitor")

    // MARK: - Initialization
    private init() {
        startMonitoring()
    }

    deinit {
        monitor.cancel()
    }

    // MARK: - Network Monitoring
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = path.status == .satisfied

                if path.usesInterfaceType(.wifi) {
                    self?.connectionType = .wifi
                } else if path.usesInterfaceType(.cellular) {
                    self?.connectionType = .cellular
                } else if path.usesInterfaceType(.wiredEthernet) {
                    self?.connectionType = .ethernet
                } else {
                    self?.connectionType = .unknown
                }

                #if DEBUG
                print("[Network] Status: \(path.status), Type: \(self?.connectionType.rawValue ?? "unknown")")
                #endif
            }
        }
        monitor.start(queue: monitorQueue)
    }

    // MARK: - Connection Testing
    /// Tests connectivity to all backend services
    func testConnections() async -> ConnectionTestResult {
        let startTime = Date()

        var apiReachable = false
        var firebaseReachable = false
        var errorMessage: String?

        // Test API connectivity
        do {
            let url = Configuration.apiBaseURL.appendingPathComponent("health")
            var request = URLRequest(url: url)
            request.timeoutInterval = 10
            request.httpMethod = "GET"

            let (_, response) = try await URLSession.shared.data(for: request)
            if let httpResponse = response as? HTTPURLResponse {
                apiReachable = (200...299).contains(httpResponse.statusCode)
            }
        } catch {
            errorMessage = "API: \(error.localizedDescription)"
            #if DEBUG
            print("[Network] API test failed: \(error)")
            #endif
        }

        // Test Firebase connectivity (using Google's connectivity check)
        do {
            let url = URL(string: "https://firebase.googleapis.com")!
            var request = URLRequest(url: url)
            request.timeoutInterval = 10
            request.httpMethod = "HEAD"

            let (_, response) = try await URLSession.shared.data(for: request)
            if let httpResponse = response as? HTTPURLResponse {
                firebaseReachable = (200...299).contains(httpResponse.statusCode)
            }
        } catch {
            if errorMessage == nil {
                errorMessage = "Firebase: \(error.localizedDescription)"
            }
            #if DEBUG
            print("[Network] Firebase test failed: \(error)")
            #endif
        }

        let latency = Int(Date().timeIntervalSince(startTime) * 1000)

        let result = ConnectionTestResult(
            timestamp: Date(),
            apiReachable: apiReachable,
            firebaseReachable: firebaseReachable,
            latencyMs: latency,
            error: errorMessage
        )

        lastConnectionTest = result

        #if DEBUG
        print("[Network] Connection test: API=\(apiReachable), Firebase=\(firebaseReachable), Latency=\(latency)ms")
        #endif

        return result
    }

    /// Quick check if network is available
    func requiresNetwork() -> Bool {
        !isConnected
    }
}

// MARK: - Debug View (for development)
#if DEBUG
import SwiftUI

struct NetworkDebugView: View {
    @ObservedObject var monitor = NetworkMonitor.shared
    @State private var isTesting = false

    var body: some View {
        VStack(spacing: 16) {
            // Connection Status
            HStack {
                Circle()
                    .fill(monitor.isConnected ? Color.green : Color.red)
                    .frame(width: 12, height: 12)

                Text(monitor.isConnected ? "Connected" : "Disconnected")
                    .font(.headline)

                Spacer()

                Text(monitor.connectionType.rawValue)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Divider()

            // Last Test Result
            if let result = monitor.lastConnectionTest {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Last Test: \(result.timestamp.formatted())")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        StatusBadge(label: "API", isOK: result.apiReachable)
                        StatusBadge(label: "Firebase", isOK: result.firebaseReachable)
                        if let latency = result.latencyMs {
                            Text("\(latency)ms")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(4)
                        }
                    }

                    if let error = result.error {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
            }

            // Test Button
            Button {
                Task {
                    isTesting = true
                    _ = await monitor.testConnections()
                    isTesting = false
                }
            } label: {
                HStack {
                    if isTesting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                    }
                    Text(isTesting ? "Testing..." : "Test Connections")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.theme.primary)
                .foregroundColor(.white)
                .cornerRadius(8)
            }
            .disabled(isTesting)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct StatusBadge: View {
    let label: String
    let isOK: Bool

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: isOK ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundColor(isOK ? .green : .red)
            Text(label)
        }
        .font(.caption)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(isOK ? Color.green.opacity(0.1) : Color.red.opacity(0.1))
        .cornerRadius(4)
    }
}
#endif
