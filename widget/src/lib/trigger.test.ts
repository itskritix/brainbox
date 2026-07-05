import { afterEach, describe, expect, it, vi } from "vitest";
import { installTriggerDelegation } from "./trigger.ts";

afterEach(() => {
  document.body.innerHTML = "";
});

function triggerButton(label = "Feedback"): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.setAttribute("data-brainbox-trigger", "");
  btn.textContent = label;
  document.body.appendChild(btn);
  return btn;
}

describe("installTriggerDelegation", () => {
  it("fires on a click on a trigger element", () => {
    const onTrigger = vi.fn();
    const cleanup = installTriggerDelegation(document, onTrigger);
    triggerButton().click();
    cleanup();
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("fires when the click lands on nested markup inside the trigger", () => {
    const onTrigger = vi.fn();
    const cleanup = installTriggerDelegation(document, onTrigger);
    const btn = triggerButton();
    const icon = document.createElement("span");
    btn.appendChild(icon);
    icon.click();
    cleanup();
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("fires for trigger elements added after installation (SPA case)", () => {
    const onTrigger = vi.fn();
    const cleanup = installTriggerDelegation(document, onTrigger);
    const late = triggerButton("late");
    late.click();
    cleanup();
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("supports multiple trigger elements", () => {
    const onTrigger = vi.fn();
    const cleanup = installTriggerDelegation(document, onTrigger);
    triggerButton("a").click();
    triggerButton("b").click();
    cleanup();
    expect(onTrigger).toHaveBeenCalledTimes(2);
  });

  it("ignores clicks outside trigger elements", () => {
    const onTrigger = vi.fn();
    const cleanup = installTriggerDelegation(document, onTrigger);
    const plain = document.createElement("button");
    document.body.appendChild(plain);
    plain.click();
    cleanup();
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("stops firing after cleanup", () => {
    const onTrigger = vi.fn();
    const cleanup = installTriggerDelegation(document, onTrigger);
    cleanup();
    triggerButton().click();
    expect(onTrigger).not.toHaveBeenCalled();
  });
});
