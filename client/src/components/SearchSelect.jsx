import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";

const normalize = (text) =>
  text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

export default function SearchSelect({ label, value, options, onChange }) {
  const { t } = useI18n();
  const id = useId();
  const input = useRef(null);
  const popup = useRef(null);
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({});
  const selected = options.find((option) => option.value === value);
  const matches = options.filter((option) =>
    normalize(
      `${option.label} ${option.description || ""} ${option.search || ""} ${option.value}`,
    ).includes(normalize(query.trim())),
  );
  const activeIndex = Math.min(active, matches.length - 1);

  function show() {
    setQuery("");
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setOpen(true);
  }
  function choose(option) {
    if (!option) return;
    setOpen(false);
    setQuery("");
    onChange(option.value);
    input.current.focus();
  }
  useEffect(() => {
    if (!open) return;
    function place() {
      const rect = input.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const bottom = top + (viewport?.height || window.innerHeight);
      const below = bottom - rect.bottom - 8;
      const above = rect.top - top - 8;
      const upwards = below < 220 && above > below;
      const height = Math.min(300, Math.max(44, upwards ? above : below));
      setPosition({
        position: "fixed",
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - rect.width - 8),
        ),
        width: rect.width,
        maxHeight: height,
        top: upwards ? undefined : rect.bottom + 4,
        bottom: upwards ? window.innerHeight - rect.top + 4 : undefined,
      });
    }
    function outside(event) {
      if (
        !root.current?.contains(event.target) &&
        !popup.current?.contains(event.target)
      )
        setOpen(false);
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-option-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, query, id]);

  return (
    <div ref={root}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={input}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? `${id}-list` : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          className="input pe-11 truncate"
          autoComplete="off"
          value={open ? query : selected?.label || value}
          placeholder={open ? t("common:search") : label}
          onFocus={(event) => event.currentTarget.select()}
          onClick={() => {
            if (!open) show();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onBlur={(event) => {
            if (
              event.relatedTarget &&
              !root.current?.contains(event.relatedTarget) &&
              !popup.current?.contains(event.relatedTarget)
            )
              setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            } else if (event.key === "Tab") setOpen(false);
            else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) show();
              else
                setActive(
                  Math.max(
                    0,
                    Math.min(
                      matches.length - 1,
                      activeIndex + (event.key === "ArrowDown" ? 1 : -1),
                    ),
                  ),
                );
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (open) choose(matches[activeIndex]);
              else show();
            }
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute end-0 top-0 min-h-11 min-w-11 flex items-center justify-center"
          aria-label={label}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) setOpen(false);
            else show();
            input.current.focus();
          }}
        >
          <span aria-hidden="true">▾</span>
        </button>
      </div>
      {open &&
        createPortal(
          <div
            ref={popup}
            style={position}
            className="z-[100] overflow-y-auto overscroll-contain rounded-lg border border-gray-300 bg-white shadow-xl dark:bg-[#333333] dark:border-[#555555] custom-scrollbar"
          >
            <ul id={`${id}-list`} role="listbox" aria-label={label}>
              {matches.map((option, index) => (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={option.value === value}
                  className={`min-h-11 px-3 py-2 cursor-pointer break-words ${index === activeIndex ? "bg-primary-50 dark:bg-[#454545]" : "hover:bg-gray-100 dark:hover:bg-[#454545]"}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                >
                  <div className="flex justify-between gap-2">
                    <bdi>{option.label}</bdi>
                    {option.value === value && (
                      <span aria-hidden="true">✓</span>
                    )}
                  </div>
                  {option.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      <bdi>{option.description}</bdi>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {matches.length === 0 && (
              <p role="status" className="p-3 text-sm">
                {t("common:noResults")}
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
