import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../../src/App.jsx";
import { createMemoryMissionProofClient } from "../../src/lib/api/MissionProofClient.js";

async function reachResults(user) {
  render(<App client={createMemoryMissionProofClient()} />);
  await user.click(screen.getByRole("button", { name: "Enter MissionProof" }));
  await user.click(await screen.findByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Agree and continue" }));
  await user.click(await screen.findByRole("radio", { name: /Explore career paths/ }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  const input = await screen.findByRole("textbox", { name: "Primary AFSC" });
  await user.type(input, "1n0x1");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByRole("heading", { name: "Research leads based on your confirmed AFSC and goal" });
}

describe("MissionProof no-key walking path", () => {
  it("moves from consent to a saved research target and one next action", async () => {
    const user = userEvent.setup();
    await reachResults(user);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const firstResult = screen.getByRole("heading", { name: "All Source Intelligence Analyst" }).closest("li");
    await user.click(within(firstResult).getByRole("button", { name: "Review this path" }));
    expect(within(firstResult).getByRole("heading", { name: "Why this appeared" })).toBeVisible();
    await user.click(within(firstResult).getByRole("button", { name: "Save to plan" }));
    expect(await screen.findByText("Saved to your plan")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "View plan" }));
    expect(await screen.findByRole("heading", { level: 1, name: /Verify the current requirements for All Source Intelligence Analyst/ })).toBeVisible();
    expect(screen.getByText("1N0X1")).toBeVisible();
  });

  it("keeps one result expanded at a time and limits the default view to three leads", async () => {
    const user = userEvent.setup();
    await reachResults(user);

    const first = screen.getByRole("heading", { name: "All Source Intelligence Analyst" }).closest("li");
    const second = screen.getByRole("heading", { name: "Logistics Plans" }).closest("li");
    await user.click(within(first).getByRole("button", { name: "Review this path" }));
    expect(within(first).getByRole("heading", { name: "Evidence used" })).toBeVisible();
    await user.click(within(second).getByRole("button", { name: "Review this path" }));
    expect(within(first).queryByRole("heading", { name: "Evidence used" })).not.toBeInTheDocument();
    expect(within(second).getByRole("heading", { name: "Evidence used" })).toBeVisible();

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /Show all paths/ })).not.toBeInTheDocument();
  });

  it("navigates an empty-plan next action without patching a synthetic item id", async () => {
    const client = createMemoryMissionProofClient();
    await client.recordConsent("design-fork-v1");
    await client.setGoal("paths");
    await client.confirmAfsc("1N0X1");
    const updatePlanItem = vi.spyOn(client, "updatePlanItem");
    window.history.replaceState({}, "", "/app/plan");
    const user = userEvent.setup();
    render(<App client={client} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Review three research leads" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Start this action" }));
    expect(await screen.findByRole("heading", { name: "Research leads based on your confirmed AFSC and goal" })).toBeVisible();
    expect(window.location.pathname).toBe("/app/explore");
    expect(updatePlanItem).not.toHaveBeenCalled();
  });

  it("navigates the all-complete next action and patches only the active plan item", async () => {
    const client = createMemoryMissionProofClient();
    await client.recordConsent("design-fork-v1");
    await client.setGoal("paths");
    await client.confirmAfsc("1N0X1");
    const assessment = await client.assessPathways({ goal: "paths", primaryAfsc: "1N0X1" });
    await client.saveTarget(assessment.results[0].pathwayId);
    const updatePlanItem = vi.spyOn(client, "updatePlanItem");
    window.history.replaceState({}, "", "/app/plan");
    const user = userEvent.setup();
    render(<App client={client} />);

    const firstAction = await screen.findByRole("heading", { level: 1, name: /Verify the current requirements/ });
    expect(firstAction).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Start this action" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Choose another research target" })).toBeVisible();
    expect(updatePlanItem).toHaveBeenCalledTimes(1);
    expect(updatePlanItem.mock.calls[0][0]).toMatch(/^planitem-/);

    await user.click(screen.getByRole("button", { name: "Start this action" }));
    expect(await screen.findByRole("heading", { name: "Research leads based on your confirmed AFSC and goal" })).toBeVisible();
    expect(window.location.pathname).toBe("/app/explore");
    expect(updatePlanItem).toHaveBeenCalledTimes(1);
  });

  it("keeps Translate in the four-group shell on direct navigation", async () => {
    const client = createMemoryMissionProofClient();
    await client.recordConsent("design-fork-v1");
    await client.setGoal("translate");
    await client.confirmAfsc("1N0X1");
    window.history.replaceState({}, "", "/app/translation");
    render(<App client={client} />);

    expect(await screen.findByRole("heading", { name: "Translate your confirmed experience" })).toBeVisible();
    const journeys = screen.getByRole("navigation", { name: "MissionProof journeys" });
    expect(within(journeys).getByRole("button", { name: "Translate" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("1N0X1")).toBeVisible();
    expect(screen.queryByRole("navigation", { name: "MissionProof progression" })).not.toBeInTheDocument();
    expect(screen.queryByText(/MAGE scores/i)).not.toBeInTheDocument();
  });

  it("keeps AFSC help visible while Continue is disabled for an empty field", async () => {
    const client = createMemoryMissionProofClient();
    await client.recordConsent("design-fork-v1");
    await client.setGoal("paths");
    window.history.replaceState({}, "", "/app/profile");
    render(<App client={client} />);

    expect(await screen.findByText(/Use the code shown in your current general service records/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("shows deterministic loading and safe failure copy", async () => {
    window.history.replaceState({}, "", "/app");
    const slowClient = createMemoryMissionProofClient({ latency: 25 });
    const view = render(<App client={slowClient} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading your local session");
    await screen.findByRole("heading", { name: "Before you add service information" });

    view.unmount();
    window.history.replaceState({}, "", "/app");
    render(<App client={createMemoryMissionProofClient({ failAt: "getSession" })} />);
    expect(await screen.findByRole("heading", { name: /local service is unavailable/i })).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  it("opens a four-group journey sheet and labels the current group", async () => {
    window.history.replaceState({}, "", "/app/consent");
    const user = userEvent.setup();
    render(<App client={createMemoryMissionProofClient()} />);
    await screen.findByRole("heading", { name: "Before you add service information" });
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const sheet = screen.getByRole("navigation", { name: "Choose a journey" });
    expect(within(sheet).getByRole("button", { name: /Profile Current journey/ })).toHaveAttribute("aria-current", "page");
    expect(within(sheet).getAllByRole("button")).toHaveLength(5);
  });
});
