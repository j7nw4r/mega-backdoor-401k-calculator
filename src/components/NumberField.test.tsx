// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberField } from "./NumberField";

afterEach(cleanup);

/** Wrapper that mirrors how App drives the field: numeric state in, number out. */
function Harness({ initial = 150000 }: { initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <NumberField label="Annual salary" value={value} onChange={setValue} />
      <output data-testid="model">{value}</output>
    </>
  );
}

describe("NumberField", () => {
  it("lets you clear the field instead of leaving a stuck leading zero", async () => {
    const user = userEvent.setup();
    render(<Harness initial={150000} />);
    const input = screen.getByLabelText("Annual salary") as HTMLInputElement;

    await user.clear(input);
    // The visible field is empty (the bug left a "0" here), even though the
    // numeric model falls back to 0 for the engine.
    expect(input.value).toBe("");
    expect(screen.getByTestId("model").textContent).toBe("0");
  });

  it("does not prepend a zero when typing a fresh value after clearing", async () => {
    const user = userEvent.setup();
    render(<Harness initial={150000} />);
    const input = screen.getByLabelText("Annual salary") as HTMLInputElement;

    await user.clear(input);
    await user.type(input, "2000");
    expect(input.value).toBe("2000"); // not "02000"
    expect(screen.getByTestId("model").textContent).toBe("2000");
  });

  it("normalizes the display on blur", async () => {
    const user = userEvent.setup();
    render(<Harness initial={0} />);
    const input = screen.getByLabelText("Annual salary") as HTMLInputElement;

    await user.clear(input);
    expect(input.value).toBe("");
    await user.tab(); // blur
    expect(input.value).toBe("0");
  });

  it("shows the error message and marks the field invalid when error is set", () => {
    render(
      <NumberField
        label="Current age"
        value={5}
        onChange={() => {}}
        error="Must be at least 16"
      />,
    );
    const input = screen.getByLabelText("Current age");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Must be at least 16")).toBeTruthy();
  });
});
