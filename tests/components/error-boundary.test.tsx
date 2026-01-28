import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// suppress console.error from ErrorBoundary's componentDidCatch
vi.spyOn(console, "error").mockImplementation(() => {});

function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("test error message");
  }
  return <div>recovered</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(
      screen.getByText("This section encountered an error")
    ).toBeInTheDocument();
  });

  it("displays the error message in the fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("test error message")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("custom fallback")).toBeInTheDocument();
  });

  it("resets error state when retry button is clicked", () => {
    let shouldThrow = true;
    function ConditionalThrower() {
      if (shouldThrow) throw new Error("boom");
      return <div>recovered</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("This section encountered an error")
    ).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText("Retry"));

    rerender(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText("recovered")).toBeInTheDocument();
  });
});
