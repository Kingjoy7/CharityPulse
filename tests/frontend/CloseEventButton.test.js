import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CloseEventButton from "../../src/frontend/components/CloseEventButton";

// Mock AuthContext
jest.mock("../../src/frontend/contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "mock-token"
  })
}));

// Mock global confirm()
global.confirm = jest.fn(() => true);

// Mock fetch
global.fetch = jest.fn();

describe("CloseEventButton", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("calls fetch with correct parameters", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    render(<CloseEventButton eventId="123" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /close event/i }));
    });

    // Ensure fetch was called once
    expect(fetch.mock.calls.length).toBe(1);

    // Check correct URL
    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:5001/api/events/123/close"
    );

    // Check correct headers
    expect(fetch.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-auth-token": "mock-token",
          "Content-Type": "application/json"
        })
      })
    );
  });
});
