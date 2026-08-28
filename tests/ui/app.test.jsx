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
    const heading = await screen.findByRole("heading", { name: "Before you add service information" });
    const consentScreen = heading.closest("main");
    const continueButton = within(consentScreen).getByRole("button", { name: "Agree and continue" });
    expect(continueButton).toBeDisabled();
    expect(within(consentScreen).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "#missionproof-terms");
    expect(within(consentScreen).getByRole("link", { name: "Privacy Notice" })).toHaveAttribute("href", "#missionproof-privacy");
    expect(within(consentScreen).getByRole("heading", { name: "Terms" })).toBeVisible();
    expect(within(consentScreen).getByText(/does not determine official eligibility/i)).toBeVisible();
    expect(within(consentScreen).getByRole("heading", { name: "Privacy Notice" })).toBeVisible();
    expect(within(consentScreen).getByText(/process-local development state/i)).toBeVisible();
    await user.click(within(consentScreen).getByRole("checkbox"));
    await user.click(continueButton);
    expect(await screen.findByRole("heading", { name: "What would make this visit useful?" })).toBeVisible();
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
