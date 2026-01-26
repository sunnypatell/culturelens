//
//  KeychainService.swift
//  CultureLens
//
//  Secure storage using iOS Keychain
//

import Foundation
import Security

final class KeychainService {
    // MARK: - Singleton
    static let shared = KeychainService()

    private init() {}

    // MARK: - Save
    func save(_ data: Data, forKey key: KeychainKey) throws {
        // Delete existing item first
        try? delete(key: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]

        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.unableToSave(status)
        }
    }

    func save(_ string: String, forKey key: KeychainKey) throws {
        guard let data = string.data(using: .utf8) else {
            throw KeychainError.invalidData
        }
        try save(data, forKey: key)
    }

    // MARK: - Retrieve
    func retrieve(key: KeychainKey) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            throw KeychainError.itemNotFound
        }

        guard let data = result as? Data else {
            throw KeychainError.invalidData
        }

        return data
    }

    func retrieveString(key: KeychainKey) throws -> String {
        let data = try retrieve(key: key)
        guard let string = String(data: data, encoding: .utf8) else {
            throw KeychainError.invalidData
        }
        return string
    }

    // MARK: - Delete
    func delete(key: KeychainKey) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue
        ]

        let status = SecItemDelete(query as CFDictionary)

        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unableToDelete(status)
        }
    }

    // MARK: - Clear All
    func clearAll() throws {
        for key in [KeychainKey.authToken, KeychainKey.refreshToken, KeychainKey.userId] {
            try? delete(key: key)
        }
    }

    // MARK: - Check Existence
    func exists(key: KeychainKey) -> Bool {
        do {
            _ = try retrieve(key: key)
            return true
        } catch {
            return false
        }
    }
}

// MARK: - Keychain Error
enum KeychainError: LocalizedError {
    case unableToSave(OSStatus)
    case unableToDelete(OSStatus)
    case itemNotFound
    case invalidData

    var errorDescription: String? {
        switch self {
        case .unableToSave(let status):
            return "Unable to save to Keychain (status: \(status))"
        case .unableToDelete(let status):
            return "Unable to delete from Keychain (status: \(status))"
        case .itemNotFound:
            return "Item not found in Keychain"
        case .invalidData:
            return "Invalid data format"
        }
    }
}
