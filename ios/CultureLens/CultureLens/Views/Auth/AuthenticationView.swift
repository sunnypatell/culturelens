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
    @State private var animateOrbs = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Rich gradient background matching webapp
                LinearGradient(
                    colors: [
                        Color(hex: "#4f46e5"),
                        Color(hex: "#6366f1"),
                        Color(hex: "#7c3aed"),
                        Color(hex: "#8b5cf6")
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                // Animated floating orbs
                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 250, height: 250)
                    .blur(radius: 40)
                    .offset(
                        x: animateOrbs ? -60 : 60,
                        y: animateOrbs ? -100 : -60
                    )

                Circle()
                    .fill(Color(hex: "#d946ef").opacity(0.15))
                    .frame(width: 200, height: 200)
                    .blur(radius: 50)
                    .offset(
                        x: animateOrbs ? 80 : -40,
                        y: animateOrbs ? 100 : 60
                    )

                Circle()
                    .fill(Color(hex: "#06b6d4").opacity(0.1))
                    .frame(width: 180, height: 180)
                    .blur(radius: 35)
                    .offset(
                        x: animateOrbs ? -50 : 50,
                        y: animateOrbs ? 50 : 150
                    )

                ScrollView {
                    VStack(spacing: 28) {
                        // Logo and title
                        VStack(spacing: 14) {
                            ZStack {
                                Circle()
                                    .fill(.white.opacity(0.15))
                                    .frame(width: 96, height: 96)
                                    .blur(radius: 1)

                                Circle()
                                    .fill(.white.opacity(0.1))
                                    .frame(width: 110, height: 110)

                                Image(systemName: "waveform.circle.fill")
                                    .font(.system(size: 52))
                                    .foregroundColor(.white)
                                    .shadow(color: .black.opacity(0.1), radius: 4)
                            }

                            Text("CultureLens")
                                .font(.system(size: 34, weight: .bold, design: .rounded))
                                .foregroundColor(.white)

                            Text("Understand conversations through a cultural lens")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.85))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 20)
                        }
                        .padding(.top, 50)

                        // Auth form card - glassmorphism
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
                        .background {
                            RoundedRectangle(cornerRadius: 28)
                                .fill(.ultraThinMaterial)
                                .shadow(color: .black.opacity(0.15), radius: 30, y: 15)
                        }
                        .overlay {
                            RoundedRectangle(cornerRadius: 28)
                                .stroke(.white.opacity(0.2), lineWidth: 1)
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 40)
                }
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 10).repeatForever(autoreverses: true)) {
                    animateOrbs = true
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

            VStack(spacing: 14) {
                // Email field
                AuthTextField(
                    label: "Email",
                    icon: "envelope.fill",
                    placeholder: "Enter your email",
                    text: $authViewModel.email
                )
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .disableAutocorrection(true)

                // Password field
                AuthTextField(
                    label: "Password",
                    icon: "lock.fill",
                    placeholder: "Enter your password",
                    text: $authViewModel.password,
                    isSecure: true
                )
                .textContentType(.password)

                // Forgot password
                HStack {
                    Spacer()
                    Button("Forgot password?") {
                        isShowingForgotPassword = true
                    }
                    .font(.footnote.weight(.medium))
                    .foregroundColor(Color.theme.primary)
                }
            }

            // Sign in button
            Button {
                Task {
                    await authViewModel.signIn()
                }
            } label: {
                HStack(spacing: 8) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(LinearGradient.primaryGradient)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 4)
            }
            .disabled(authViewModel.isLoading || !authViewModel.canSignIn)
            .opacity(authViewModel.canSignIn ? 1 : 0.6)

            // Divider
            HStack(spacing: 16) {
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

            // Google sign in
            Button {
                Task {
                    await authViewModel.signInWithGoogle()
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "g.circle.fill")
                        .font(.title3)

                    Text("Continue with Google")
                        .fontWeight(.medium)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color(.systemBackground))
                        .shadow(color: .black.opacity(0.06), radius: 4, y: 2)
                }
                .foregroundColor(.primary)
                .overlay {
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color(.separator), lineWidth: 1)
                }
            }
            .disabled(authViewModel.isLoading)

            // Sign up link
            HStack(spacing: 4) {
                Text("Don't have an account?")
                    .foregroundColor(.secondary)

                Button("Sign Up") {
                    withAnimation(.spring(response: 0.4)) {
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

    var body: some View {
        VStack(spacing: 20) {
            Text("Create Account")
                .font(.title2.bold())
                .foregroundColor(.primary)

            VStack(spacing: 14) {
                AuthTextField(
                    label: "Full Name",
                    icon: "person.fill",
                    placeholder: "Enter your name",
                    text: $authViewModel.displayName
                )
                .textContentType(.name)

                AuthTextField(
                    label: "Email",
                    icon: "envelope.fill",
                    placeholder: "Enter your email",
                    text: $authViewModel.email
                )
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .disableAutocorrection(true)

                AuthTextField(
                    label: "Password",
                    icon: "lock.fill",
                    placeholder: "At least 8 characters",
                    text: $authViewModel.password,
                    isSecure: true
                )
                .textContentType(.newPassword)

                AuthTextField(
                    label: "Confirm Password",
                    icon: "lock.fill",
                    placeholder: "Confirm your password",
                    text: $authViewModel.confirmPassword,
                    isSecure: true,
                    trailingIcon: !authViewModel.confirmPassword.isEmpty
                        ? (authViewModel.doPasswordsMatch ? "checkmark.circle.fill" : "xmark.circle.fill")
                        : nil,
                    trailingColor: authViewModel.doPasswordsMatch ? .green : .red
                )
                .textContentType(.newPassword)
            }

            // Create account button
            Button {
                Task {
                    await authViewModel.createAccount()
                }
            } label: {
                HStack(spacing: 8) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Create Account")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(LinearGradient.primaryGradient)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 4)
            }
            .disabled(authViewModel.isLoading || !authViewModel.canCreateAccount)
            .opacity(authViewModel.canCreateAccount ? 1 : 0.6)

            // Sign in link
            HStack(spacing: 4) {
                Text("Already have an account?")
                    .foregroundColor(.secondary)

                Button("Sign In") {
                    withAnimation(.spring(response: 0.4)) {
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

// MARK: - Auth Text Field
struct AuthTextField: View {
    let label: String
    let icon: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var trailingIcon: String?
    var trailingColor: Color = .secondary

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption.weight(.medium))
                .foregroundColor(.secondary)

            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(Color.theme.primary.opacity(0.6))
                    .frame(width: 20)

                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }

                if let trailingIcon = trailingIcon {
                    Image(systemName: trailingIcon)
                        .foregroundColor(trailingColor)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            }
            .overlay {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color(.separator).opacity(0.5), lineWidth: 1)
            }
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
                ZStack {
                    Circle()
                        .fill(Color.theme.primary.opacity(0.1))
                        .frame(width: 100, height: 100)

                    Image(systemName: "envelope.badge.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(LinearGradient.primaryGradient)
                }

                VStack(spacing: 8) {
                    Text("Reset Password")
                        .font(.title2.bold())

                    Text("Enter your email and we'll send you a link to reset your password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }

                AuthTextField(
                    label: "Email",
                    icon: "envelope.fill",
                    placeholder: "Enter your email",
                    text: $authViewModel.email
                )
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
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
                    .padding(.vertical, 14)
                    .background(LinearGradient.primaryGradient)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 4)
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
