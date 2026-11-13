import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PhaseOne } from "@/components/hamsa/phase-one";
afterEach(cleanup);
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

describe("HAMSA rendered journey", () => {
  it("completes the English journey, changes a response, exports, and clears the session", () => {
    render(<PhaseOne />);
    click("Start");
    click("English");
    click("Boy");
    click("Continue");
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Tap the box to enter your name"), {
      target: { value: "Test Sami" },
    });
    click("Continue");
    click("Stomach Pain");
    click("Continue");
    click("Yes");
    click("Vomiting");
    click("Continue");
    click("Not sure");
    expect(
      screen.getByRole("heading", { name: "That’s okay! Let’s try another way." }),
    ).toBeInTheDocument();
    click("Other feelings");
    click("I’m done");
    click("View clinical summary");
    expect(screen.getByText("Test Sami")).toBeInTheDocument();
    expect(screen.getAllByText("Not assessed")).toHaveLength(2);
    click("Change answer: Stomach pain");
    click("No");
    click("End");
    click("View clinical summary");
    expect(screen.getByText("No", { selector: "dd" })).toBeInTheDocument();
    click("Save");
    expect(screen.getByRole("button", { name: "Download PNG" })).toBeInTheDocument();
    click("Back to summary");
    click("End");
    click("Cancel");
    expect(screen.getByText("Test Sami")).toBeInTheDocument();
    click("End");
    click("Clear session and continue");
    expect(screen.getByRole("heading", { name: "Session ended" })).toBeInTheDocument();
    expect(screen.queryByText("Test Sami")).not.toBeInTheDocument();
    click("Restart");
    click("Start");
    click("English");
    click("Girl");
    click("Continue");
    expect(screen.getByLabelText("Tap the box to enter your name")).toHaveValue("");
  });
  it("supports Arabic girl wording, RTL, virtual keyboard, backspace, and backward answer editing", () => {
    render(<PhaseOne />);
    click("Start");
    click("العربية");
    click("بنت");
    click("يلا نكمّل!");
    expect(document.documentElement.dir).toBe("rtl");
    const input = screen.getByLabelText<HTMLInputElement>("اضغطي هنا واكتبي اسمك.");
    fireEvent.focus(input);
    click("ن");
    click("و");
    click("ر");
    expect(input).toHaveValue("نور");
    input.setSelectionRange(3, 3);
    click("حذف حرف");
    expect(input).toHaveValue("نو");
    click("ر");
    click("يلا نكمّل!");
    click("بطني يوجعني");
    click("يلا نكمّل!");
    click("مو متأكدة");
    click("رجوع");
    expect(screen.getByRole("button", { name: "مو متأكدة" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    click("أيوه");
    click("خلاص، انتهيت.");
    click("عرض الملخص");
    expect(screen.getByText("نور")).toBeInTheDocument();
    expect(screen.getByText("نعم", { selector: "dd" })).toBeInTheDocument();
  });
});
