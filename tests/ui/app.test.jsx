import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../../src/App.jsx";

describe("MissionProof critical journeys", () => {
  it("requires informed consent before onboarding", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Enter MissionProof" }));
    const dialog = screen.getByRole("dialog", { name: "Before you start" });
    const continueButton = within(dialog).getByRole("button", { name: "Agree & continue" });
    expect(continueButton).toBeDisabled();
    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(continueButton);
    expect(screen.getByRole("dialog", { name: "What brings you to MissionProof" })).toBeVisible();
  });

  it("searches a skill, saves a pathway, and carries it into the plan", async () => {
    window.history.replaceState({}, "", "/app/competency-search");
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("textbox", { name: "Skill, capability, or work you enjoy" });
    await user.clear(search);
    await user.type(search, "cyber");
    await user.click(screen.getByRole("button", { name: "Search pathways" }));
    const result = screen.getByRole("heading", { name: "Cybersecurity Analyst" }).closest("article");
    await user.click(within(result).getByRole("button", { name: "+ Add to plan" }));
    expect(within(result).getByRole("button", { name: "Added to plan" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Open Transition Plan/ }));
    expect(screen.getByRole("heading", { name: "Cybersecurity Analyst" })).toBeVisible();
  });

  it("updates transition-plan readiness when an action is completed", async () => {
    window.history.replaceState({}, "", "/app/itp");
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("heading", { name: "0% ready to brief" })).toBeVisible();
    await user.click(screen.getByRole("checkbox", { name: /Collect three mission-impact stories/ }));
    expect(screen.getByRole("heading", { name: "14% ready to brief" })).toBeVisible();
  });
});
