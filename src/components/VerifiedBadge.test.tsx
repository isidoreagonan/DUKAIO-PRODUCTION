import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { VerifiedBadge, isBadgeExpired } from "./VerifiedBadge";

// Pointer-event helpers for Radix Tooltip in jsdom
beforeEach(() => {
  (HTMLElement.prototype as any).hasPointerCapture = () => false;
  (HTMLElement.prototype as any).setPointerCapture = () => {};
  (HTMLElement.prototype as any).releasePointerCapture = () => {};
  (HTMLElement.prototype as any).scrollIntoView = () => {};
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const openTooltip = async () => {
  const trigger = screen.getByTestId("verified-badge");
  // Radix tooltip opens on focus or pointerEnter — use focus, which is reliable in jsdom
  fireEvent.focus(trigger);
  fireEvent.pointerEnter(trigger);
};

describe("VerifiedBadge", () => {
  it("affiche le label lisible Standard quand showLabel=true", () => {
    render(<VerifiedBadge grade="standard" showLabel />);
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("affiche le label lisible Pro quand showLabel=true", () => {
    render(<VerifiedBadge grade="pro" showLabel />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("affiche le label lisible Premium quand showLabel=true", () => {
    render(<VerifiedBadge grade="premium" showLabel />);
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("affiche le niveau et la description dans le tooltip pour un badge actif", async () => {
    render(<VerifiedBadge grade="pro" expiresAt="2099-12-31T00:00:00Z" />);
    await openTooltip();

    await waitFor(() => {
      expect(screen.getAllByText(/Verify Pro/).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/500 000 FCFA/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Valide jusqu'au/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/31 décembre 2099/).length).toBeGreaterThan(0);
  });

  it("affiche 'Expiré le …' pour un badge expiré et applique le style expiré", async () => {
    render(<VerifiedBadge grade="standard" showLabel expiresAt="2020-01-15T00:00:00Z" />);

    // Visual style: expired data attribute and label suffix
    const trigger = screen.getByTestId("verified-badge");
    expect(trigger.getAttribute("data-expired")).toBe("true");
    expect(screen.getByText(/\(expiré\)/)).toBeInTheDocument();

    await openTooltip();

    await waitFor(() => {
      expect(screen.getAllByText(/Expiré le/).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/15 janvier 2020/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Renouvelez l'abonnement/).length).toBeGreaterThan(0);
  });

  it("ne marque pas comme expiré quand expiresAt est absent", () => {
    render(<VerifiedBadge grade="premium" />);
    const trigger = screen.getByTestId("verified-badge");
    expect(trigger.getAttribute("data-expired")).toBe("false");
  });
});

describe("isBadgeExpired", () => {
  it("retourne false si la date est nulle ou absente", () => {
    expect(isBadgeExpired(null)).toBe(false);
    expect(isBadgeExpired(undefined)).toBe(false);
  });

  it("retourne true pour une date passée", () => {
    expect(isBadgeExpired("2000-01-01T00:00:00Z")).toBe(true);
  });

  it("retourne false pour une date future", () => {
    expect(isBadgeExpired("2099-01-01T00:00:00Z")).toBe(false);
  });

  it("retourne false pour une date invalide", () => {
    expect(isBadgeExpired("not-a-date")).toBe(false);
  });
});
