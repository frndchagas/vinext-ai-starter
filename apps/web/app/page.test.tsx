import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("starter home", () => {
  it("presents the architecture and the baseline decisions", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Vinext AI Starter for Laravel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The baseline settles the recurring decisions." }),
    ).toBeInTheDocument();
    expect(screen.getByText("A serious starting point for AI software.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View architecture" })).toHaveAttribute(
      "href",
      "#architecture",
    );
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText("8 checks passed")).toBeInTheDocument();
  });
});
