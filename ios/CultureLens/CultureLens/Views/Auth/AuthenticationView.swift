//
//  AuthenticationView.swift
//  CultureLens
//
//  Main authentication container with sign in and sign up
//

import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var isShowingSignUp = false
    @State private var isShowingForgotPassword = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient.primaryGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {
                        // Logo and title
                        VStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(.white.opacity(0.2))
                                    .frame(width: 100, height: 100)

                                Image(systemName: "waveform.circle.fill")
                                    .font(.system(size: 48))
                                    .foregroundColor(.white)
                            }

                            Text("CultureLens")
                                .font(.system(size: 36, weight: .bold, design: .rounded))
                                .foregroundColor(.white)

                            Text("Understand conversations through a cultural lens")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.8))
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 60)

                        // Auth form card
                        VStack(spacing: 24) {
                            if isShowingSignUp {
                                SignUpFormView(
                                    isShowingSignUp: $isShowingSignUp
                                )
                            } else {
                                SignInFormView(
                                    isShowingSignUp: $isShowingSignUp,
                                    isShowingForgotPassword: $isShowingForgotPassword
                                )
                            }
                        }
                        .padding(24)
                        .background(.ultraThinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 24))
                        .shadow(color: .black.opacity(0.2), radius: 20, y: 10)
                        .padding(.horizontal, 24)
                    }
                    .padding(.bottom, 40)
                }
            }
            .sheet(isPresented: $isShowingForgotPassword) {
                ForgotPasswordView()
            }
            .alert("Error", isPresented: $authViewModel.showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(authViewModel.errorMessage ?? "An error occurred")
            }
        }
    }
}

// MARK: - Sign In Form
struct SignInFormView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Binding var isShowingSignUp: Bool
    @Binding var isShowingForgotPassword: Bool

    @FocusState private var focusedField: Field?

    enum Field {
        case email
        case password
    }

    var body: some View {
        VStack(spacing: 20) {
            Text("Welcome Back")
                .font(.title2.bold())
                .foregroundColor(.primary)

            VStack(spacing: 16) {
                // Email field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(.secondary)

                        TextField("Enter your email", text: $authViewModel.email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                            .focused($focusedField, equals: .email)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                // Password field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Password")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.secondary)

                        SecureField("Enter your password", text: $authViewModel.password)
                            .textContentType(.password)
                            .focused($focusedField, equals: .password)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                // Forgot password
                HStack {
                    Spacer()
                    Button("Forgot password?") {
                        isShowingForgotPassword = true
                    }
                    .font(.footnote)
                    .foregroundColor(Color.theme.primary)
                }
            }

            // Sign in button
            Button {
                Task {
                    await authViewModel.signIn()
                }
            } label: {
                HStack {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.theme.primary)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(authViewModel.isLoading || !authViewModel.canSignIn)
            .opacity(authViewModel.canSignIn ? 1 : 0.6)

            // Divider
            HStack {
                Rectangle()
                    .fill(Color(.separator))
                    .frame(height: 1)

                Text("or")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Rectangle()
                    .fill(Color(.separator))
                    .frame(height: 1)
            }

            // Social sign in buttons
            Button {
                Task {
                    await authViewModel.signInWithGoogle()
                }
            } label: {
                HStack {
                    Image(systemName: "g.circle.fill")
                        .font(.title2)

                    Text("Continue with Google")
                        .fontWeight(.medium)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemGray6))
                .foregroundColor(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(authViewModel.isLoading)

            // Sign up link
            HStack {
                Text("Don't have an account?")
                    .foregroundColor(.secondary)

                Button("Sign Up") {
                    withAnimation {
                        isShowingSignUp = true
                    }
                }
                .fontWeight(.semibold)
                .foregroundColor(Color.theme.primary)
            }
            .font(.footnote)
        }
    }
}

// MARK: - Sign Up Form
struct SignUpFormView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Binding var isShowingSignUp: Bool

    @FocusState private var focusedField: Field?

    enum Field {
        case name
        case email
        case password
        case confirmPassword
    }

    var body: some View {
        VStack(spacing: 20) {
            Text("Create Account")
                .font(.title2.bold())
                .foregroundColor(.primary)

            VStack(spacing: 16) {
                // Name field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Full Name")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "person.fill")
                            .foregroundColor(.secondary)

                        TextField("Enter your name", text: $authViewModel.displayName)
                            .textContentType(.name)
                            .focused($focusedField, equals: .name)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                // Email field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(.secondary)

                        TextField("Enter your email", text: $authViewModel.email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                            .focused($focusedField, equals: .email)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                // Password field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Password")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.secondary)

                        SecureField("At least 8 characters", text: $authViewModel.password)
                            .textContentType(.newPassword)
                            .focused($focusedField, equals: .password)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                // Confirm password field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Confirm Password")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.secondary)

                        SecureField("Confirm your password", text: $authViewModel.confirmPassword)
                            .textContentType(.newPassword)
                            .focused($focusedField, equals: .confirmPassword)

                        if !authViewModel.confirmPassword.isEmpty {
                            Image(systemName: authViewModel.doPasswordsMatch ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .foregroundColor(authViewModel.doPasswordsMatch ? .green : .red)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }

            // Create account button
            Button {
                Task {
                    await authViewModel.createAccount()
                }
            } label: {
                HStack {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Create Account")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.theme.primary)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(authViewModel.isLoading || !authViewModel.canCreateAccount)
            .opacity(authViewModel.canCreateAccount ? 1 : 0.6)

            // Sign in link
            HStack {
                Text("Already have an account?")
                    .foregroundColor(.secondary)

                Button("Sign In") {
                    withAnimation {
                        isShowingSignUp = false
                    }
                }
                .fontWeight(.semibold)
                .foregroundColor(Color.theme.primary)
            }
            .font(.footnote)
        }
    }
}

// MARK: - Forgot Password View
struct ForgotPasswordView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var emailSent = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Image(systemName: "envelope.badge.fill")
                    .font(.system(size: 64))
                    .foregroundColor(Color.theme.primary)

                VStack(spacing: 8) {
                    Text("Reset Password")
                        .font(.title2.bold())

                    Text("Enter your email and we'll send you a link to reset your password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(.secondary)

                        TextField("Enter your email", text: $authViewModel.email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(.horizontal)

                Button {
                    Task {
                        await authViewModel.sendPasswordReset()
                        emailSent = true
                    }
                } label: {
                    HStack {
                        if authViewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("Send Reset Link")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.theme.primary)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(authViewModel.isLoading || !authViewModel.isEmailValid)
                .padding(.horizontal)

                Spacer()
            }
            .padding(.top, 40)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Email Sent", isPresented: $emailSent) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Check your inbox for password reset instructions")
            }
        }
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthViewModel())
}
