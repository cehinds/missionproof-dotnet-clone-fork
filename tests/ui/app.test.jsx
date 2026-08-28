import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/App.jsx";

/* Walk onboarding so each journey starts on the four-phase shell. */
async function enterApp(user) {
  await user.click(screen.getByRole("button", { name: "Enter MissionProof" }));
  const consent = screen.getByRole("dialog", { name: "Before you start" });
  await user.click(within(consent).getByRole("checkbox"));
  await user.click(within(consent).getByRole("button", { name: "Agree & continue" }));
  const goals = screen.getByRole("dialog", { name: "What brings you to MissionProof?" });
  await user.click(within(goals).getByRole("button", { name: /Just looking around/ }));
}

function goToPhase(user, label) {
  const rail = screen.getByRole("navigation", { name: "MissionProof phases" });
  return user.click(within(rail).getByRole("button", { name: new RegExp(label) }));
}

async function fillMinimumProfile(user) {
  await user.type(screen.getByLabelText("Primary AFSC"), "1N0X1");
  await user.selectOptions(screen.getByLabelText("Rank"), "Technical Sergeant");
  await user.selectOptions(screen.getByLabelText("Skill level"), "7-level");
  await user.click(screen.getByRole("button", { name: "Save profile" }));
}

describe("MissionProof critical journeys", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("requires informed consent before onboarding", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Enter MissionProof" }));
    const dialog = screen.getByRole("dialog", { name: "Before you start" });
    const continueButton = within(dialog).getByRole("button", { name: "Agree & continue" });
    expect(continueButton).toBeDisabled();
    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(continueButton);
    expect(screen.getByRole("dialog", { name: "What brings you to MissionProof?" })).toBeVisible();
  });

  it("gates the translation until the minimum service facts exist", async () => {
    const user = userEvent.setup();
    render(<App />);
    await enterApp(user);

    await goToPhase(user, "Translate");
    expect(screen.getByText("Set your profile first")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Open profile" }));
    await fillMinimumProfile(user);
    await goToPhase(user, "Translate");
    expect(screen.getByRole("heading", { name: /What your Air Force experience means/ })).toBeVisible();
  });

  it("saves a competency and carries it into the transition plan", async () => {
    const user = userEvent.setup();
    render(<App />);
    await enterApp(user);
    await fillMinimumProfile(user);

    await goToPhase(user, "Translate");
    await user.click(screen.getByRole("button", { name: "Competency profile" }));
    const row = screen.getByRole("heading", { name: "Operational planning" }).closest("li");
    await user.click(within(row).getByRole("button", { name: "Add to plan" }));
    expect(within(row).getByRole("button", { name: "In plan" })).toBeVisible();

    await goToPhase(user, "Plan");
    expect(screen.getByText("Competencies you are claiming")).toBeVisible();
    expect(screen.getByText(/Core competencies: Operational planning/)).toBeVisible();
  });

  it("recomputes Air Force path gaps when a composite drops", async () => {
    const user = userEvent.setup();
    render(<App />);
    await enterApp(user);

    await goToPhase(user, "Explore");
    await user.click(screen.getByRole("button", { name: "Air Force paths" }));

    const aligned = () => Number(screen.getByText("Score-aligned paths").previousSibling.textContent);
    expect(aligned()).toBeGreaterThan(2);

    const general = screen.getByLabelText("General composite score");
    await user.clear(general);
    await user.type(general, "40");
    await user.click(screen.getByRole("button", { name: "Run path match" }));

    expect(aligned()).toBeLessThan(3);
    expect(screen.getAllByText(/Closest gap: G needs/).length).toBeGreaterThan(0);
  });

  it("marks a transition action complete and moves plan readiness", async () => {
    const user = userEvent.setup();
    render(<App />);
    await enterApp(user);

    await goToPhase(user, "Plan");
    expect(screen.getByText("0%")).toBeVisible();
    await user.click(screen.getByRole("checkbox", { name: /Collect three mission-impact stories/ }));
    expect(screen.getByText("14%")).toBeVisible();
    expect(screen.getByText("1/4")).toBeVisible();
  });

  it("keeps the session and the current screen across a remount", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await enterApp(user);
    await fillMinimumProfile(user);
    await goToPhase(user, "Plan");
    first.unmount();

    render(<App />);
    /* The route is persisted, so a reload returns to the plan rather than the start. */
    expect(screen.getByRole("heading", { name: /Turn your evidence into a transition plan/ })).toBeVisible();
  });

  it("keeps an unsaved profile edit when the phase changes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await enterApp(user);
    await user.type(screen.getByLabelText("Primary AFSC"), "3D0X2");

    await goToPhase(user, "Explore");
    await goToPhase(user, "Profile");
    expect(screen.getByLabelText("Primary AFSC")).toHaveValue("3D0X2");
  });

  it("offers only federal pathways that have series behind them", async () => {
    const user = userEvent.setup();
    render(<App />);
    await enterApp(user);

    await goToPhase(user, "Explore");
    await user.click(screen.getByRole("button", { name: "Federal match" }));
    const chips = within(screen.getByRole("group", { name: "Federal pathway" })).getAllByRole("button");

    for (const chip of chips) {
      await user.click(chip);
      expect(screen.queryByText("No series mapped for this pathway yet")).toBeNull();
    }
  });
});
